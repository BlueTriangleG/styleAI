import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

/**
 * Initialize Stripe client with secret key
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

/**
 * Credit tiers configuration
 * Maps the product IDs to credit amounts
 */
export const CREDIT_TIERS = {
  basic: {
    name: "Basic",
    price: 5,
    credits: 50,
    productId: "prod_SU6UDZXYXhaqDE",
    priceId: "price_1RZ8HiPxLAUU0zQX0mAa1nF2",
  },
  standard: {
    name: "Standard",
    price: 10,
    credits: 120,
    productId: "prod_SU6UmWhIQaWMat",
    priceId: "price_1RZ8HiPxLAUU0zQXzFdRn8mC",
  },
  premium: {
    name: "Premium",
    price: 50,
    credits: 700,
    productId: "prod_SU6UsaFGdfNnmq",
    priceId: "price_1RZ8HjPxLAUU0zQXcx6JiSWH",
  },
};

/**
 * Get credit amount by product ID
 */
export function getCreditsByProductId(productId: string): number {
  const tier = Object.values(CREDIT_TIERS).find(
    (t) => t.productId === productId
  );
  return tier?.credits || 0;
}

/**
 * Get tier by tier ID
 */
export function getTierById(tierId: string) {
  return CREDIT_TIERS[tierId as keyof typeof CREDIT_TIERS];
}
