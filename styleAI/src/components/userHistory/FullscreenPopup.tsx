'use client';

import { motion } from 'framer-motion';
import { HistoryReportData } from './types';
import { useEffect, useState } from 'react';

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
 * Animation variants for the modal overlay
 */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Animation variants for the modal content
 */
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

interface FullscreenPopupProps {
  report: HistoryReportData;
  onClose: () => void;
}

/**
 * FullscreenPopup Component
 * Displays a fullscreen modal with detailed report information
 *
 * @param {Object} props - Component props
 * @param {HistoryReportData} props.report - The report data to display
 * @param {Function} props.onClose - Callback function to close the popup
 * @returns {JSX.Element} Rendered component
 */
export function FullscreenPopup({ report, onClose }: FullscreenPopupProps) {
  // State to track which analysis sections are expanded
  const [expandedSections, setExpandedSections] = useState<{
    structural: boolean;
    color: boolean;
    semantic: boolean;
    overall: boolean;
  }>({
    structural: false,
    color: false,
    semantic: false,
    overall: true,
  });

  // Add effect to disable body scroll when popup is open
  useEffect(() => {
    // Save current scroll position and disable body scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  /**
   * Toggle the expanded state of a section
   * @param section - The section to toggle
   */
  const toggleSection = (
    section: 'structural' | 'color' | 'semantic' | 'overall'
  ) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Helper function to safely get nested string values
  const getNestedValue = (obj: any, path: string[]): string => {
    try {
      let current = obj;
      for (const key of path) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          return 'Not specified';
        }
      }
      return typeof current === 'string' ? current : 'Not specified';
    } catch (error) {
      return 'Not specified';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
      onClick={onClose}>
      <motion.div
        className="relative w-full max-w-5xl max-h-[85vh] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}>
        {/* Header with title and close button */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <motion.h2
            className="font-playfair text-2xl font-bold text-gray-800"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            Style Report
          </motion.h2>

          <motion.button
            className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}>
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
          </motion.button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Full report details with staggered animation */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left column - User image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}>
              <h3 className="mb-3 font-medium text-lg border-l-4 border-blue-500 pl-3">
                Your Image
              </h3>
              <div className="overflow-hidden rounded-lg shadow-md">
                {report.uploadedImage ? (
                  <img
                    src={report.uploadedImage}
                    alt="Your uploaded image"
                    className="w-full transform transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right column - Best fit image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}>
              <h3 className="mb-3 font-medium text-lg border-l-4 border-green-500 pl-3">
                Best Style Match
              </h3>
              <div className="overflow-hidden rounded-lg shadow-md">
                {report.bestFitImage ? (
                  <img
                    src={report.bestFitImage}
                    alt="Best fit style"
                    className="w-full transform transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Detailed Analysis Sections */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}>
            <h3 className="mb-4 font-medium text-xl border-l-4 border-purple-500 pl-3">
              Detailed Analysis
            </h3>

            {/* Overall Description Section */}
            <div className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left font-medium transition-colors hover:bg-gray-100"
                onClick={() => toggleSection('overall')}>
                <span className="text-lg font-medium">Overall Description</span>
                <svg
                  className={`h-5 w-5 transform transition-transform ${
                    expandedSections.overall ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedSections.overall && (
                <div className="p-4 bg-white">
                  <p className="text-gray-700 leading-relaxed">
                    {report.targetDescription?.['Your Overall Description']?.[
                      'Physical and Temperament Summary'
                    ] || 'No overall description available.'}
                  </p>
                </div>
              )}
            </div>

            {/* Structural Features Section */}
            <div className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left font-medium transition-colors hover:bg-gray-100"
                onClick={() => toggleSection('structural')}>
                <span className="text-lg font-medium">Structural Features</span>
                <svg
                  className={`h-5 w-5 transform transition-transform ${
                    expandedSections.structural ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedSections.structural && (
                <div className="p-4 bg-white">
                  {/* Body Features */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Body Features
                    </h4>
                    <div className="pl-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">
                          Height and Visual Impression:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Height and Visual Impression',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Head-to-Body Proportion:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Head-to-Body Proportion and Visual Effect',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Body Type and Curve Characteristics:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Body Type and Curve Characteristics',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Overall Body Weight Impression:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Overall Body Weight Impression',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Shoulder Width and Ratio:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Shoulder Width and Head-to-Shoulder Ratio',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Waistline Position and Proportion:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Waistline Position and Upper-to-Lower Body Proportion',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Limb Length and Proportion:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Limb Length and Visual Proportion',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Limb Thickness and Definition:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Limb Thickness and Line Definition',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Facial Hair:</span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Body Features',
                          'Body Hair Characteristics',
                          'Facial Hair',
                        ])}
                      </div>
                    </div>
                  </div>

                  {/* Facial Features */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">
                      Facial Features
                    </h4>
                    <div className="pl-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Hairstyle Details:</span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Facial Features',
                          'Hairstyle Details and Style Characteristics',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Face Shape:</span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Facial Features',
                          'Face Shape and Visual Outline',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Facial Structure:</span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Facial Features',
                          'Facial Structure and Visual Features',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Facial Contour:</span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Facial Features',
                          'Facial Contour and Line Definition',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Neck Length:</span>
                        {getNestedValue(report.targetDescription, [
                          'Structural Features',
                          'Facial Features',
                          'Neck Length and Line Characteristics',
                        ])}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Color Features Section */}
            <div className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left font-medium transition-colors hover:bg-gray-100"
                onClick={() => toggleSection('color')}>
                <span className="text-lg font-medium">Color Features</span>
                <svg
                  className={`h-5 w-5 transform transition-transform ${
                    expandedSections.color ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedSections.color && (
                <div className="p-4 bg-white">
                  <div className="pl-3 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Skin Tone:</span>
                      {getNestedValue(report.targetDescription, [
                        'Color Features',
                        'Skin Tone and Visual Characteristics',
                      ])}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Hair Color:</span>
                      {getNestedValue(report.targetDescription, [
                        'Color Features',
                        'Hair Color and Saturation',
                      ])}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">
                        Clothing Color Suggestions:
                      </span>
                      {getNestedValue(report.targetDescription, [
                        'Color Features',
                        'Clothing Color Optimization Suggestions',
                      ])}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Semantic Features Section */}
            <div className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left font-medium transition-colors hover:bg-gray-100"
                onClick={() => toggleSection('semantic')}>
                <span className="text-lg font-medium">Semantic Features</span>
                <svg
                  className={`h-5 w-5 transform transition-transform ${
                    expandedSections.semantic ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedSections.semantic && (
                <div className="p-4 bg-white">
                  {/* Intrinsic Features */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Intrinsic Features
                    </h4>
                    <div className="pl-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Gender:</span>
                        {getNestedValue(report.targetDescription, [
                          'Semantic Features',
                          'Intrinsic Features',
                          'Gender',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Age Range:</span>
                        {getNestedValue(report.targetDescription, [
                          'Semantic Features',
                          'Intrinsic Features',
                          'Age Range Visual Estimation',
                        ])}
                      </div>
                    </div>
                  </div>

                  {/* Temperament Features */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">
                      Temperament Features
                    </h4>
                    <div className="pl-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">
                          Overall Style Impression:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Semantic Features',
                          'Temperament Features',
                          'Overall Style First Impression',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Personality Impressions:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Semantic Features',
                          'Temperament Features',
                          'Personality Impressions from Expression and Posture',
                        ])}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Style Optimization Suggestions:
                        </span>
                        {getNestedValue(report.targetDescription, [
                          'Semantic Features',
                          'Temperament Features',
                          'Style Optimization and Temperament Enhancement Suggestions',
                        ])}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Style recommendations */}
          <motion.div
            className="mt-8 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}>
            <h3 className="mb-4 font-medium text-xl border-l-4 border-amber-500 pl-3">
              Style Recommendations
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {report.otherStyleRecommendations.map((style, index) => (
                <motion.div
                  key={index}
                  className="group overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}>
                  {style.imageUrl ? (
                    <div className="overflow-hidden">
                      <img
                        src={style.imageUrl}
                        alt={getStyleDisplayName(style.styleType)}
                        className="h-48 w-full object-cover transform transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-800">
                      {getStyleDisplayName(style.styleType)}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
