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

/**
 * Schema for createCreditInvoice input
 */
const createCreditInvoiceSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1 cent'),
  credits: z.number().min(1, 'Credits must be at least 1'),
  description: z.string().optional(),
});

/**
 * Creates an invoice for credit purchase and handles the credit granting process
 * @param {Object} data - The input data containing the amount, credits, and description
 * @returns {Promise<Object>} Result with invoice URL or error
 */
export async function createCreditInvoice(data: {
  amount: number;
  credits: number;
  description?: string;
}): Promise<{ invoiceUrl: string | null; error?: string }> {
  try {
    // Validate input data
    const validatedData = createCreditInvoiceSchema.parse(data);
    const { amount, credits, description } = validatedData;

    const stripe = getStripeInstance();

    // Get the authenticated user's customer ID
    // In a real app, you would get this from your authentication system
    // This is a simplified example - you need to implement proper user authentication
    const customerId = await getCurrentUserStripeCustomerId();

    if (!customerId) {
      return {
        invoiceUrl: null,
        error: 'User not authenticated or no Stripe customer found',
      };
    }

    // Create a draft invoice for the customer
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      description: description || `Credit purchase: ${credits} points`,
      metadata: {
        credits_to_grant: credits.toString(),
        credit_purchase: 'true',
      },
    });

    // Add invoice item for the credit purchase
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: amount,
      currency: 'usd',
      description: description || `Credit package - ${credits} points`,
    });

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      invoice.id as string
    );

    // Send the invoice to the customer
    await stripe.invoices.sendInvoice(invoice.id as string);

    // Return the hosted invoice URL where the customer can pay
    return { invoiceUrl: finalizedInvoice.hosted_invoice_url || null };
  } catch (error) {
    console.error('Error creating credit invoice:', error);
    return {
      invoiceUrl: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create credit invoice',
    };
  }
}

/**
 * Temporary function to get the current user's Stripe customer ID
 * In a real application, this would retrieve the customer ID from your authentication system
 * @returns {Promise<string|null>} The Stripe customer ID or null if not found
 */
async function getCurrentUserStripeCustomerId(): Promise<string | null> {
  // This is a placeholder - in a real app, you would:
  // 1. Get the authenticated user's ID from your auth system
  // 2. Look up the user in your database to get their Stripe customer ID
  // 3. Return the Stripe customer ID

  // For testing, you can return a hard-coded customer ID
  // WARNING: Replace this with proper authentication in production!
  return process.env.STRIPE_TEST_CUSTOMER_ID || null;
}

/**
 * Function to be called from a webhook handler when an invoice is paid
 * This grants the purchased credits to the customer
 * @param {string} invoiceId - The ID of the paid invoice
 */
export async function handlePaidCreditInvoice(
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeInstance();

    // Retrieve the invoice to get customer ID and metadata
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Check if this is a credit purchase invoice
    if (!invoice.metadata?.credit_purchase === true) {
      return { success: true }; // Not a credit invoice, nothing to do
    }

    const customerId = invoice.customer as string;
    const creditsToGrant = parseInt(
      invoice.metadata?.credits_to_grant || '0',
      10
    );

    if (!creditsToGrant) {
      return {
        success: false,
        error: 'No credits amount specified in invoice metadata',
      };
    }

    // Grant the credits to the customer
    // Note: Stripe doesn't have a creditGrants API - this would be implemented
    // in your own database to track user credits
    // Example implementation:
    await updateUserCredits(
      customerId,
      creditsToGrant,
      `Credit Purchase - Invoice ${invoice.number}`
    );

    return { success: true };
  } catch (error) {
    console.error('Error granting credits after invoice payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to grant credits',
    };
  }
}

/**
 * Updates the user's credit balance in your database
 * @param {string} customerId - The Stripe customer ID
 * @param {number} creditsToAdd - The number of credits to add to the user's balance
 * @param {string} description - Description of the credit update
 */
async function updateUserCredits(
  customerId: string,
  creditsToAdd: number,
  description: string
): Promise<void> {
  // In a real application, you would:
  // 1. Connect to your database
  // 2. Retrieve the user associated with this Stripe customer ID
  // 3. Update their credit balance
  // 4. Log the transaction

  console.log(
    `[DEMO] Added ${creditsToAdd} credits to customer ${customerId}: ${description}`
  );

  // This is a placeholder - implement your actual database update logic here
}
