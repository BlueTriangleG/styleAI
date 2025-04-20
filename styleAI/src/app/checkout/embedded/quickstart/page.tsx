'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { RecommendationHeader } from '@/components/recommendation/Header';
import { createCheckoutSession } from '@/app/actions/stripeActions';

/**
 * StripeCheckoutPage - Renders a checkout page with Stripe's embedded checkout form
 * Allows users to purchase Style recommends credit
 */
const StripeCheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Stripe with the public key
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  );

  useEffect(() => {
    // Create a Checkout Session as soon as the page loads
    const initCheckoutSession = async () => {
      try {
        setLoading(true);

        // Call the server action directly
        const result = await createCheckoutSession({
          productId: 'prod_SABGtwXELcJ7EZ', // Product ID
        });

        if (result.error || !result.clientSecret) {
          throw new Error(result.error || 'Failed to create checkout session');
        }

        setClientSecret(result.clientSecret);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
        console.error('Error creating checkout session:', err);
      } finally {
        setLoading(false);
      }
    };

    initCheckoutSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RecommendationHeader />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#2D4B37] mb-8 font-playfair text-center">
            Subscribe to Style Recommends
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D4B37] mx-auto"></div>
                <p className="mt-4 text-gray-600">Preparing your checkout...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">Oops! Something went wrong.</p>
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 bg-[#2D4B37] text-white px-6 py-2.5 rounded-md font-medium hover:bg-[#1F3526] transition-colors">
                  Try Again
                </button>
              </div>
            ) : (
              clientSecret && (
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              )
            )}
          </div>

          <div className="mt-8 text-center text-gray-600">
            <p>
              Get personalized style recommendations with our premium
              subscription service.
            </p>
            <p className="mt-2">
              Subscribe now for ongoing access to AI-powered style analysis and
              recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutPage;
