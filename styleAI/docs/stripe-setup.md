# Stripe Integration Setup Guide

## Overview

This guide explains how to set up Stripe integration for the Style AI credits system.

## Prerequisites

- Stripe account (test or live mode)
- Environment variables configured
- Node.js and npm installed

## Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URL (for redirects)
APP_URL=http://localhost:3000  # Change for production
```

## Setting Up Webhook

### 1. Local Development with Stripe CLI

Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret that appears and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 2. Production Setup

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select the following events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the signing secret and add it to your production environment variables

## Testing the Integration

### 1. Test Payment Flow

1. Start your development server: `npm run dev`
2. Navigate to `/credits`
3. Click on any credit package
4. Use test card: `4242 4242 4242 4242`
5. Any future date for expiry
6. Any 3 digits for CVC
7. Any 5 digits for ZIP

### 2. Verify Credits Added

After successful payment:

- Check the database to confirm credits were added to the user
- Check Stripe Dashboard for the payment

## Product Configuration

The system is configured with three tiers:

| Tier     | Price | Credits | Product ID          |
| -------- | ----- | ------- | ------------------- |
| Basic    | $5    | 50      | prod_SU3mQs1hFRz19j |
| Standard | $10   | 120     | prod_SU43JGuASYidkf |
| Premium  | $50   | 700     | prod_SU43k7UQxrb4VR |

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**

   - Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
   - Check that you're using the correct endpoint secret

2. **Credits not added after payment**

   - Check webhook logs in Stripe Dashboard
   - Ensure database connection is working
   - Check server logs for errors

3. **Checkout session creation fails**
   - Verify `STRIPE_SECRET_KEY` is set
   - Check that user is authenticated
   - Ensure product IDs are correct

## Security Notes

- Never commit `.env` files with real keys
- Use test keys for development
- Rotate keys periodically
- Always verify webhook signatures in production
