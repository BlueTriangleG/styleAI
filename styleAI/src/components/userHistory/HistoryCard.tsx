'use client';

import { useState } from 'react';
import { Tilt } from '@/components/ui/tilt';
import { HistoryReportData } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { FullscreenPopup } from './FullscreenPopup';

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
    <>
      <Tilt
        rotationFactor={5}
        className="overflow-hidden rounded-lg"
        springOptions={{
          stiffness: 300,
          damping: 30,
        }}>
        <motion.div
          className="flex h-full flex-col bg-white shadow-md transition-all hover:shadow-lg cursor-pointer"
          onClick={() => setShowDetails(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}>
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
        </motion.div>
      </Tilt>

      {/* Animated fullscreen popup */}
      <AnimatePresence>
        {showDetails && (
          <FullscreenPopup
            report={report}
            onClose={() => setShowDetails(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
