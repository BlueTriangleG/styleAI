'use server';

import Stripe from 'stripe';
import { z } from 'zod';

/**
 * Initialize Stripe with the API key
 * @returns {Stripe} Initialized Stripe instance
 */
const getStripeInstance = (): Stripe => {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
};

/**
 * Schema for createCheckoutSession input
 */
const createCheckoutSessionSchema = z.object({
  productId: z.string(),
});

/**
 * Creates a Stripe checkout session for the provided product
 * @param {Object} data - The input data containing the product ID
 * @returns {Promise<Object>} The checkout session client secret
 */
export async function createCheckoutSession(data: {
  productId: string;
}): Promise<{ clientSecret: string | null; error?: string }> {
  try {
    // Validate input data
    const validatedData = createCheckoutSessionSchema.parse(data);
    const { productId } = validatedData;

    const stripe = getStripeInstance();

    // First, get the product to verify it exists
    const product = await stripe.products.retrieve(productId);

    if (!product) {
      return { clientSecret: null, error: 'Product not found' };
    }

    // Get the prices associated with this product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    });

    // If no active price found, return an error
    if (prices.data.length === 0) {
      return {
        clientSecret: null,
        error: 'No active price found for this product',
      };
    }

    const priceId = prices.data[0].id;
    const price = prices.data[0];

    // Check if the price has a metered usage type
    const isMetered = price.recurring?.usage_type === 'metered';

    // Create the checkout session with the price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          // Only include quantity for non-metered prices
          ...(isMetered ? {} : { quantity: 1 }),
        },
      ],
      mode: price.recurring ? 'subscription' : 'payment', // Use subscription mode for recurring prices, payment mode otherwise
      ui_mode: 'embedded',
      return_url: `${
        process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
      }/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return { clientSecret: session.client_secret || null };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      clientSecret: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create checkout session',
    };
  }
}

/**
 * Schema for getCheckoutStatus input
 */
const getCheckoutStatusSchema = z.object({
  sessionId: z.string(),
});

/**
 * Gets the status of a Stripe checkout session
 * @param {Object} data - The input data containing the session ID
 * @returns {Promise<Object>} The checkout session status
 */
export async function getCheckoutStatus(data: { sessionId: string }): Promise<{
  status?: string | null;
  customer_email?: string | null;
  payment_status?: string | null;
  error?: string;
}> {
  try {
    // Validate input data
    const validatedData = getCheckoutStatusSchema.parse(data);
    const { sessionId } = validatedData;

    if (!sessionId) {
      return { error: 'Missing session_id parameter' };
    }

    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      status: session.status || null,
      customer_email: session.customer_details?.email || null,
      payment_status: session.payment_status || null,
    };
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return { error: 'Failed to retrieve checkout session' };
  }
}
