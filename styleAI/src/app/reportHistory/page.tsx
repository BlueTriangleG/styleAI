'use client';

import { useEffect, useState } from 'react';
import { HistoryCardGrid } from '@/components/userHistory/HistoryCardGrid';
import { HistoryReportData } from '@/components/userHistory/types';
import { useAuth } from '@clerk/nextjs';
import { getUserHistory } from '@/app/actions/getUserHistory';
import { currentUser } from '@clerk/nextjs/server';

/**
 * ReportHistory Page
 *
 * Displays a collection of the user's past style reports in a grid layout.
 * Each report is displayed as a card with basic information and the ability
 * to view detailed results.
 *
 * @returns {JSX.Element} Rendered page component
 */
export default function ReportHistoryPage() {
  const [reports, setReports] = useState<HistoryReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get authentication status from Clerk
  const { isLoaded, userId: clerkUserId, isSignedIn } = useAuth();

  // Get the database user ID when auth is loaded
  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn) {
        if (isLoaded && !isSignedIn) {
          setError('Please sign in to view your reports');
        }
        return;
      }

      try {
        // Make API call to sync user data
        const response = await fetch('/styleai/api/users/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`
          );
        }

        // Check content type to ensure we're getting JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response is not JSON:', contentType);
          throw new Error('Server did not return JSON');
        }

        const data = await response.json();

        if (data.success && data.userId) {
          console.log('User synced successfully, userId:', data.userId);
          setUserId(data.userId);
        } else {
          console.error('Failed to sync user:', data.error || 'Unknown error');
          setError('Failed to authenticate user');
        }
      } catch (err) {
        console.error('Error syncing user:', err);
        setError(
          'Failed to load user data. Please check if the API server is running.'
        );
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn]);

  // Fetch reports when userId is available
  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return;

      setIsLoading(true);
      console.log('Fetching reports for user:', userId);
      try {
        // Call the server action to get user history
        const historyData = await getUserHistory(userId);
        setReports(historyData);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load your report history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
          <h1 className="font-playfair text-3xl font-bold text-gray-800">
            Your reports
          </h1>

          <div className="flex space-x-3">
            <button className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                />
              </svg>
            </button>
            <button className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto mb-4 h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="font-playfair text-lg font-medium text-gray-900">
                {error}
              </h3>
              <p className="mt-1 font-inter text-gray-500">
                Please try again later or contact support if the problem
                persists.
              </p>
            </div>
          </div>
        ) : (
          <HistoryCardGrid
            reports={reports}
            isLoading={isLoading || !userId || !isLoaded}
          />
        )}
      </div>
    </div>
  );
}
