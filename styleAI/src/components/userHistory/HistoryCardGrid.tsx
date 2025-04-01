'use client';

import { HistoryCard } from './HistoryCard';
import { HistoryReportData } from './types';
import { LoadingAnimation } from '@/components/loading/LoadingAnimation';

/**
 * HistoryCardGrid component
 * Displays a grid of history report cards
 *
 * @param {Object} props - Component props
 * @param {HistoryReportData[]} props.reports - Array of report data to display
 * @param {boolean} props.isLoading - Whether the data is still loading
 * @returns {JSX.Element} Rendered component
 */
export function HistoryCardGrid({
  reports,
  isLoading = false,
}: {
  reports: HistoryReportData[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingAnimation message="Loading your reports" showSteps={false} />
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4 h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="font-playfair text-lg font-medium text-gray-900">
            No reports yet
          </h3>
          <p className="mt-1 font-inter text-gray-500">
            You haven&apos;t created any style reports yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {reports.map((report) => (
        <div key={report.id} className="h-[380px]">
          <HistoryCard report={report} />
        </div>
      ))}
    </div>
  );
}
