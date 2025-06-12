/**
 * API route to create Stripe payment link for purchasing credits
 * POST /api/stripe/create-payment-link
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe, getTierById } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  updateUserStripeCustomerId,
  getUserByProvider,
  autoSyncClerkUser,
} from "@/lib/models/user";

export async function POST(request: NextRequest) {
  try {
    // Get current user from Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user info from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unable to fetch user information" },
        { status: 401 }
      );
    }

    // Try to get user from database, if not found, auto-sync
    let user = await getUserByProvider("clerk", clerkUserId);

    if (!user) {
      console.log(
        `User not found in database, auto-syncing Clerk user: ${clerkUserId}`
      );
      try {
        user = await autoSyncClerkUser(clerkUser);
        console.log(`Successfully auto-synced user with ID: ${user.id}`);
      } catch (syncError) {
        console.error("Failed to auto-sync user:", syncError);
        return NextResponse.json(
          { error: "Failed to sync user account. Please try again." },
          { status: 500 }
        );
      }
    }

    // Get tier from request body
    const { tierId } = await request.json();

    if (!tierId) {
      return NextResponse.json(
        { error: "Tier ID is required" },
        { status: 400 }
      );
    }

    const tier = getTierById(tierId);
    if (!tier) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.username,
        metadata: {
          userId: user.id.toString(),
          clerkUserId: clerkUserId,
        },
      });

      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await updateUserStripeCustomerId(user.id, stripeCustomerId);
      console.log(
        `Created Stripe customer ${stripeCustomerId} for user ${user.id}`
      );
    }

    // Create price if we have product ID
    let priceId: string;

    if (tier.productId) {
      // Create a one-time price for the product
      const price = await stripe.prices.create({
        product: tier.productId,
        unit_amount: tier.price * 100, // Convert to cents
        currency: "usd",
        metadata: {
          credits: tier.credits.toString(),
          tier: tierId,
        },
      });
      priceId = price.id;
    } else {
      // For products not yet created, return error
      return NextResponse.json(
        { error: "Product not yet configured in Stripe" },
        { status: 400 }
      );
    }

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_creation: "always",
      metadata: {
        userId: user.id.toString(),
        clerkUserId: clerkUserId,
        tierId: tierId,
        credits: tier.credits.toString(),
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.APP_URL}/credits?success=true`,
        },
      },
    });

    return NextResponse.json({
      url: paymentLink.url,
    });
  } catch (error) {
    console.error("Error creating payment link:", error);

    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
