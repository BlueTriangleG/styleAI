/**
 * API route to create Stripe checkout session for purchasing credits
 * POST /api/stripe/create-checkout-session
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
    } else {
      // Verify that the customer exists in Stripe, if not create a new one
      try {
        await stripe.customers.retrieve(stripeCustomerId);
        console.log(`Using existing Stripe customer ${stripeCustomerId}`);
      } catch (error: any) {
        if (error.code === "resource_missing") {
          console.log(
            `Stripe customer ${stripeCustomerId} not found, creating new one`
          );

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

          // Update user with new Stripe customer ID
          await updateUserStripeCustomerId(user.id, stripeCustomerId);
          console.log(
            `Created new Stripe customer ${stripeCustomerId} for user ${user.id}`
          );
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
    }

    // Create checkout session using pre-created price
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: tier.priceId, // Use pre-created price ID
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.APP_URL}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/credits?canceled=true`,
      metadata: {
        userId: user.id.toString(),
        clerkUserId: clerkUserId,
        tierId: tierId,
        credits: tier.credits.toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
