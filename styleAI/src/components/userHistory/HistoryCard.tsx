'use client';

import { useState } from 'react';
import { Tilt } from '@/components/ui/tilt';
import { HistoryReportData } from './types';

/**
 * Formats a date to a relative time string (e.g., "2 days ago")
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted relative time string
 */
const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return 'Unknown date';

  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (minutes > 0)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

  return 'Just now';
};

/**
 * Gets a friendly display name for the style type
 * @param styleType - The internal style type identifier
 * @returns A user-friendly display name
 */
const getStyleDisplayName = (styleType: string): string => {
  switch (styleType) {
    case 'casual_daily':
      return 'Casual Daily';
    case 'professional_work':
      return 'Professional Work';
    case 'social_gathering':
      return 'Social Gathering';
    case 'outdoor_sports':
      return 'Outdoor Sports';
    default:
      return styleType;
  }
};

/**
 * HistoryCard component
 * Displays a single report history entry with user uploaded image and generated images
 *
 * @param {Object} props - Component props
 * @param {HistoryReportData} props.report - Report data to display
 * @returns {JSX.Element} Rendered component
 */
export function HistoryCard({ report }: { report: HistoryReportData }) {
  const [showDetails, setShowDetails] = useState(false);

  // Format the creation time for display using our custom function
  const timeAgo = report.createdAt
    ? formatTimeAgo(report.createdAt)
    : 'Unknown date';

  return (
    <Tilt
      rotationFactor={5}
      className="overflow-hidden rounded-lg"
      springOptions={{
        stiffness: 300,
        damping: 30,
      }}>
      <div
        className="flex h-full flex-col bg-white shadow-md transition-all hover:shadow-lg cursor-pointer"
        onClick={() => setShowDetails(true)}>
        {/* Best Fit Image with badge overlay */}
        <div className="relative h-52">
          {report.bestFitImage ? (
            <img
              src={report.bestFitImage}
              alt="Best fit style"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-gray-400">No best fit image</span>
            </div>
          )}

          {/* Time indicator - top right */}
          <div className="absolute right-2 top-2">
            <span className="rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
              {timeAgo}
            </span>
          </div>

          {/* Style Report badge - bottom left */}
          <div className="absolute bottom-2 left-2">
            <span className="rounded-md bg-blue-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Style Report
            </span>
          </div>
        </div>

        {/* Card content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Analysis header */}
          <h3 className="font-playfair text-lg font-medium text-gray-800">
            Style Analysis
          </h3>

          {/* Analysis summary */}
          <div className="mt-2 text-sm text-gray-600 line-clamp-3">
            <p>{report.analysisResult}</p>
          </div>

          {/* Recommendations */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-sm text-gray-700">
              <p className="font-medium">Style recommendations:</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {report.otherStyleRecommendations.map((style, index) => (
                  <span
                    key={index}
                    className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {getStyleDisplayName(style.styleType)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed view modal */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowDetails(false)}>
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              onClick={() => setShowDetails(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="mb-4 font-playfair text-2xl font-bold text-gray-800">
              Style Report
            </h2>

            {/* Full report details */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left column - User image */}
              <div>
                <h3 className="mb-2 font-medium">Your Image</h3>
                <div className="overflow-hidden rounded-lg">
                  {report.uploadedImage ? (
                    <img
                      src={report.uploadedImage}
                      alt="Your uploaded image"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - Best fit image */}
              <div>
                <h3 className="mb-2 font-medium">Best Style Match</h3>
                <div className="overflow-hidden rounded-lg">
                  {report.bestFitImage ? (
                    <img
                      src={report.bestFitImage}
                      alt="Best fit style"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Result */}
            <div className="mt-6">
              <h3 className="mb-3 font-medium">Analysis Result</h3>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-gray-700">{report.analysisResult}</p>
              </div>
            </div>

            {/* Style recommendations */}
            <div className="mt-6">
              <h3 className="mb-3 font-medium">Style Recommendations</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
                {report.otherStyleRecommendations.map((style, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-gray-200">
                    {style.imageUrl ? (
                      <img
                        src={style.imageUrl}
                        alt={getStyleDisplayName(style.styleType)}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-medium">
                        {getStyleDisplayName(style.styleType)}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Tilt>
  );
}
