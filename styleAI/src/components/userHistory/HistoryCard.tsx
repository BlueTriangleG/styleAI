'use client';

import { useState } from 'react';
import { Tilt } from '@/components/ui/tilt';
import { HistoryReportData } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { FullscreenPopup } from './FullscreenPopup';
import { Spotlight } from '@/components/ui/spotlight';

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
  const [isHovered, setIsHovered] = useState(false);

  // Format the creation time for display using our custom function
  const timeAgo = report.createdAt
    ? formatTimeAgo(report.createdAt)
    : 'Unknown date';

  return (
    <>
      <Tilt
        rotationFactor={7}
        className="h-full w-full overflow-hidden rounded-xl shadow-lg"
        springOptions={{
          stiffness: 300,
          damping: 30,
        }}>
        <motion.div
          className="group relative flex h-full flex-col bg-white transition-all hover:shadow-xl cursor-pointer"
          onClick={() => setShowDetails(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}>
          {/* Spotlight effect */}
          <Spotlight
            className="-z-1 from-blue-100/20 via-blue-200/10 to-transparent opacity-0 group-hover:opacity-100"
            size={300}
          />

          {/* Best Fit Image with badge overlay */}
          <div className="relative h-100">
            {report.bestFitImage ? (
              <motion.img
                src={report.bestFitImage}
                alt="Best fit style"
                className="h-full w-full object-cover transition-transform duration-700"
                initial={{ scale: 1 }}
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-gray-400">No best fit image</span>
              </div>
            )}

            {/* Time indicator - top right */}
            <div className="absolute right-4 top-4">
              <motion.span
                className="rounded-md bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 backdrop-blur-sm shadow-sm"
                initial={{ opacity: 0.8, y: -5 }}
                animate={{
                  opacity: isHovered ? 1 : 0.8,
                  y: isHovered ? 0 : -5,
                }}
                transition={{ duration: 0.3 }}>
                {timeAgo}
              </motion.span>
            </div>

            {/* Style Report badge - bottom left */}
            <div className="absolute bottom-4 left-4">
              <motion.span
                className="rounded-md bg-blue-500/90 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm shadow-sm"
                initial={{ opacity: 0.9 }}
                animate={{
                  opacity: isHovered ? 1 : 0.9,
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}>
                Style Report
              </motion.span>
            </div>
          </div>

          {/* Card content */}
          <div className="flex flex-1 flex-col p-5">
            {/* Analysis header */}
            <motion.h3
              className="font-playfair text-xl font-medium text-gray-800"
              animate={{
                opacity: isHovered ? 1 : 0.9,
                y: isHovered ? 0 : 3,
              }}
              transition={{ duration: 0.3 }}>
              Style Analysis
            </motion.h3>

            {/* Analysis summary */}
            <div className="mt-3 text-sm text-gray-600 line-clamp-4">
              <p>{report.analysisResult}</p>
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
