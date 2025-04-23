'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RecommendationHeader } from '@/components/recommendation/Header';
import Link from 'next/link';
import { getCheckoutStatus } from '@/app/actions/stripeActions';

/**
 * CheckoutReturnPage - Handles the return from Stripe checkout
 * Shows the status of the checkout process to the user
 */
const CheckoutReturnPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    'success' | 'processing' | 'error' | 'loading'
  >('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID found. Please try again.');
      return;
    }

    // Fetch the checkout session status using server action
    const fetchCheckoutSession = async () => {
      try {
        // Call the server action directly
        const result = await getCheckoutStatus({ sessionId });

        if (result.error) {
          setStatus('error');
          setMessage(
            result.error ||
              'Failed to verify checkout status. Please contact support.'
          );
          return;
        }

        if (result.status === 'complete') {
          setStatus('success');
          setMessage('Your subscription has been successfully activated!');
        } else if (result.status === 'open') {
          setStatus('processing');
          setMessage(
            "Your payment is being processed. We'll update you once it's complete."
          );
        } else {
          setStatus('error');
          setMessage(
            'Something went wrong with your checkout. Please try again.'
          );
        }
      } catch (error) {
        console.error('Error fetching checkout status:', error);
        setStatus('error');
        setMessage(
          'An unexpected error occurred. Please try again or contact support.'
        );
      }
    };

    fetchCheckoutSession();
  }, [searchParams]);

  // Redirect to home after 5 seconds on success
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (status === 'success') {
      timeoutId = setTimeout(() => {
        router.push('/');
      }, 5000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RecommendationHeader />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D4B37] mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Verifying your subscription...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-[#2D4B37]">
                Thank You!
              </h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <p className="mt-4 text-sm text-gray-500">
                Redirecting you to the home page in a few seconds...
              </p>
            </>
          )}

          {status === 'processing' && (
            <>
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-[#2D4B37]">
                Almost there!
              </h2>
              <p className="mt-2 text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-[#2D4B37]">
                Oops!
              </h2>
              <p className="mt-2 text-gray-600">{message}</p>
            </>
          )}

          <div className="mt-8">
            <Link
              href="/"
              className="text-[#2D4B37] hover:text-[#1F3526] font-medium transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutReturnPage;
