'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RecommendationHeader } from '@/components/recommendation/Header';

/**
 * Credit purchase tiers data
 */
const CREDIT_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 5,
    points: 50,
    description: 'Perfect for getting started',
    popular: false,
    features: ['Access to style recommendations', 'Basic report generation'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 10,
    points: 120,
    description: '20% bonus credits',
    popular: true,
    features: [
      'Access to style recommendations',
      'Detailed reports',
      'Priority processing',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 50,
    points: 700,
    description: '40% bonus credits',
    popular: false,
    features: [
      'Access to style recommendations',
      'Premium reports',
      'Priority processing',
      'Extended history',
    ],
  },
];

/**
 * CreditsPage - Shows available credit purchase options
 * Allows users to choose a credit package and proceed to checkout
 */
export default function CreditsPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle credit purchase
   * Creates an invoice for the selected tier
   */
  const handlePurchase = async (tierId: string) => {
    try {
      setLoading(tierId);
      setError(null);

      const tier = CREDIT_TIERS.find((t) => t.id === tierId);
      if (!tier) {
        throw new Error('Invalid tier selected');
      }

      // TODO: Implement new payment system
      // For now, show a message that the feature is under development
      throw new Error('Payment feature is temporarily unavailable. We are redesigning our payment system. Please check back later.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      console.error('Error creating invoice:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RecommendationHeader />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#2D4B37] mb-4 font-playfair text-center">
            Purchase Style AI Credits
          </h1>

          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Get personalized style recommendations with our premium credits
            system. Choose a package that suits your needs and enhance your
            style journey.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-center">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {CREDIT_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                  tier.popular ? 'border-[#2D4B37]' : 'border-gray-200'
                }`}>
                {tier.popular && (
                  <div className="bg-[#2D4B37] text-white py-1 px-4 text-center text-sm font-medium">
                    Best Value
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#2D4B37] mb-2">
                    {tier.name} Package
                  </h3>
                  <p className="text-gray-600 mb-4">{tier.description}</p>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[#2D4B37]">
                      ${tier.price}
                    </span>
                    <span className="text-gray-500 ml-1">one-time</span>
                  </div>

                  <div className="mb-6">
                    <span className="text-2xl font-semibold text-[#2D4B37]">
                      {tier.points}
                    </span>
                    <span className="text-gray-500 ml-1">credits</span>
                  </div>

                  <ul className="mb-6 space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(tier.id)}
                    disabled={loading === tier.id}
                    className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors ${
                      tier.popular
                        ? 'bg-[#2D4B37] text-white hover:bg-[#1F3526]'
                        : 'bg-white border border-[#2D4B37] text-[#2D4B37] hover:bg-gray-50'
                    }`}>
                    {loading === tier.id ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Purchase Credits'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-gray-600">
            <p className="mb-4">
              Credits never expire and can be used for any style recommendation
              service.
            </p>
            <p>
              Need more credits? Contact us for custom packages at{' '}
              <a
                href="mailto:support@stylerecommend.ai"
                className="text-[#2D4B37] underline hover:text-[#1F3526]">
                support@stylerecommend.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
