/**
 * Stripe webhook handler for processing payment events
 * POST /api/stripe/webhook
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe, getTierById } from "@/lib/stripe";
import { getUserById, addUserCredits } from "@/lib/models/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Received webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout session completed:", session.id);

        // Extract metadata
        const { userId, tierId, credits } = session.metadata || {};

        if (!userId || !tierId || !credits) {
          console.error("Missing metadata in checkout session:", {
            userId,
            tierId,
            credits,
          });
          return NextResponse.json(
            { error: "Missing required metadata" },
            { status: 400 }
          );
        }

        // Verify the tier and credits amount
        const tier = getTierById(tierId);
        if (!tier) {
          console.error(`Invalid tier ID: ${tierId}`);
          return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }

        if (parseInt(credits) !== tier.credits) {
          console.error(
            `Credits mismatch: expected ${tier.credits}, got ${credits}`
          );
          return NextResponse.json(
            { error: "Credits amount mismatch" },
            { status: 400 }
          );
        }

        try {
          // Get user to verify they exist
          const user = await getUserById(parseInt(userId));
          if (!user) {
            console.error(`User not found: ${userId}`);
            return NextResponse.json(
              { error: "User not found" },
              { status: 404 }
            );
          }

          // Add credits to user account
          await addUserCredits(parseInt(userId), tier.credits);

          console.log(
            `Successfully added ${tier.credits} credits to user ${userId}`
          );

          // Log the successful transaction
          console.log(`Payment completed:`, {
            sessionId: session.id,
            userId: userId,
            userEmail: user.email,
            tier: tier.name,
            credits: tier.credits,
            amount: tier.price,
          });
        } catch (error) {
          console.error("Error updating user credits:", error);
          return NextResponse.json(
            { error: "Failed to update credits" },
            { status: 500 }
          );
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
