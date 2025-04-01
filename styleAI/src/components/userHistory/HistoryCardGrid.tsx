'use client';

import { HistoryCard } from './HistoryCard';
import { HistoryReportData } from './types';

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
        <div className="flex flex-col items-center">
          <svg
            className="mb-4 h-12 w-12 animate-spin-slow text-[#84a59d]"
            viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
              opacity="0.25"
            />
            <path
              fill="currentColor"
              d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
            />
          </svg>
          <p className="font-inter text-gray-500">Loading your reports...</p>
        </div>
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
