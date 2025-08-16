'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ModernLoadingSpinner } from '@/components/loading/ModernLoadingSpinner';
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from 'react-zoom-pan-pinch';

/**
 * Image zoom controls component
 * Provides zoom in, zoom out, and reset controls for the image
 */
const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute bottom-3 right-3 flex space-x-2 z-10">
      <button
        onClick={() => zoomIn()}
        className="bg-white/80 hover:bg-white text-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all"
        aria-label="Zoom in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <button
        onClick={() => zoomOut()}
        className="bg-white/80 hover:bg-white text-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all"
        aria-label="Zoom out">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <button
        onClick={() => resetTransform()}
        className="bg-white/80 hover:bg-white text-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all"
        aria-label="Reset zoom">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
      </button>
    </div>
  );
};

/**
 * Zoomable image component
 * Wraps an image with zoom and pan capabilities
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {string} props.className - Additional CSS classes
 */
const ZoomableImage = ({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <div className="relative w-full h-full">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit={true}>
        {() => (
          <>
            <ZoomControls />
            <TransformComponent
              wrapperClass="w-full h-full"
              contentClass={`w-full h-full ${className}`}>
              {src && (
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
              )}
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

/**
 * Interface for style recommendation items
 */
interface StyleRecommendation {
  title: string;
  description: string;
  examples: string[];
}

/**
 * Interface for analysis results
 */
interface AnalysisResults {
  faceShape: string;
  skinTone: string;
  bodyType: string;
  styleMatch: string;
}

/**
 * Props for the StyleRecommendations component
 */
interface StyleRecommendationsProps {
  userImage: string | null;
  bestFitImage: string | null;
  styleRecommendations: StyleRecommendation[];
  analysisResults: AnalysisResults;
  isLoadingBestFit?: boolean;
  bestFitError?: string | null;
  analysisData?: any; // 添加分析数据
}

/**
 * Zoomable card component for style recommendations
 * Allows zooming and panning of style example images
 * @param {Object} props - Component props
 * @param {string} props.imageUrl - Image source URL
 * @param {string} props.title - Style title
 * @param {string} props.description - Style description
 */
const ZoomableCard = ({
  imageUrl,
  title,
  description,
}: {
  imageUrl?: string;
  title: string;
  description: string;
}) => {
  const [showZoom, setShowZoom] = useState(false);

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden transition-all hover:shadow-md">
      <div
        className="aspect-[3/4] bg-gray-100 relative cursor-pointer"
        onClick={() => setShowZoom(true)}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} example`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 font-inter">Style Example</span>
          </div>
        )}

        {/* Zoom hint icon */}
        {imageUrl && (
          <div className="absolute bottom-2 right-2 bg-white/70 rounded-full p-1.5 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-lg font-medium mb-1 font-playfair text-gray-800">
          {title}
        </h4>
        <p className="text-sm text-gray-600 font-inter line-clamp-2">
          {description.substring(0, 80)}...
        </p>
      </div>

      {/* Fullscreen zoom modal */}
      {showZoom && imageUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowZoom(false);
          }}>
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => setShowZoom(false)}
                className="bg-white/80 hover:bg-white text-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all"
                aria-label="Close">
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="h-[80vh]">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={5}
                centerOnInit={true}>
                {() => (
                  <>
                    <ZoomControls />
                    <TransformComponent wrapperClass="w-full h-full">
                      <img
                        src={imageUrl}
                        alt={`${title} example - fullscreen view`}
                        className="w-full h-full object-contain"
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>

            <div className="p-4 bg-white">
              <h3 className="text-lg font-bold mb-1 font-playfair text-gray-800">
                {title}
              </h3>
              <p className="text-sm text-gray-600 font-inter">{description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to safely get nested string values from analysis data
 * @param obj - The object to traverse
 * @param path - Array of keys representing the path to the value
 * @returns The string value or 'Not specified' if not found
 */
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

/**
 * Style Recommendations Component
 *
 * Displays personalized style recommendations based on user image and analysis.
 * Shows the best fit recommendation along with alternative style options.
 *
 * @param {StyleRecommendationsProps} props - Component properties
 * @returns {JSX.Element} Rendered component
 */
export default function StyleRecommendations({
  userImage,
  bestFitImage,
  styleRecommendations,
  analysisResults,
  isLoadingBestFit = false,
  bestFitError = null,
  analysisData = null,
}: StyleRecommendationsProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  
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

  // Check screen size on client-side
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Get the first recommendation as the best recommendation
  const bestRecommendation = styleRecommendations[0];

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

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-12 text-center font-playfair text-gray-800">
          Your Style Recommendations
        </h1>

        {userImage ? (
          <div className="max-w-6xl mx-auto">
            {/* Best Recommendation Section */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8 font-playfair text-gray-800 border-b border-gray-200 pb-2">
                Your best fit recommendation
              </h2>

              {/* Image Comparison Row - Full Width */}
              <div className="mb-8">
                <div
                  className={`flex ${
                    isMobile ? 'flex-col' : 'flex-row'
                  } items-center gap-4 md:gap-8 justify-center`}>
                  {/* User Uploaded Image */}
                  <div
                    className={`${
                      isMobile ? 'w-full h-[60vh]' : 'w-[500px] aspect-[3/4]'
                    } bg-white/60 backdrop-blur-xs rounded-lg overflow-hidden shadow-md relative`}>
                    <div className="absolute inset-0 p-1">
                      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2 text-center">
                          <span className="text-sm font-medium text-gray-600 font-inter">
                            Your Original Photo
                          </span>
                        </div>
                        <div className="h-[calc(100%-32px)]">
                          {userImage ? (
                            <ZoomableImage
                              src={userImage}
                              alt="Your uploaded image"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-inter">
                                Your Image
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow - Responsive placement */}
                  <div
                    className={`${
                      isMobile ? 'rotate-90 my-4' : ''
                    } flex justify-center items-center`}>
                    <div className="bg-white/80 rounded-full p-4 shadow-md">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#84a59d]"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Best Fit Image */}
                  <div
                    className={`${
                      isMobile ? 'w-full h-[60vh]' : 'w-[500px] aspect-[3/4]'
                    } bg-white/60 backdrop-blur-xs rounded-lg overflow-hidden relative`}>
                    <div className="absolute inset-0 p-1 border-2 border-[#84a59d] rounded-lg shadow-lg">
                      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                        <div className="bg-[#84a59d] p-2 text-center">
                          <span className="text-sm font-medium text-white font-inter">
                            Your Best Fit Style
                          </span>
                        </div>
                        <div className="h-[calc(100%-32px)]">
                          {isLoadingBestFit ? (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <ModernLoadingSpinner
                                size="md"
                                message="Generating..."
                              />
                            </div>
                          ) : bestFitError ? (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <div className="flex flex-col items-center p-4 text-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="48"
                                  height="48"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-red-500 mb-4">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                  <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className="text-red-500 font-inter text-sm">
                                  {bestFitError}
                                </span>
                                <button
                                  onClick={() => window.location.reload()}
                                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
                                  Retry
                                </button>
                              </div>
                            </div>
                          ) : bestFitImage ? (
                            <ZoomableImage
                              src={bestFitImage}
                              alt="Best fit style"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-inter">
                                Generating best fit image...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Style Recommendation Description - Full Width Below */}
              <div className="w-full bg-white/60 backdrop-blur-xs p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-6 font-playfair text-gray-800 border-b border-gray-200 pb-3">
                  Style Recommendation
                </h3>
                <div className="max-w-4xl">
                  <p className="text-lg text-gray-800 font-inter leading-relaxed">
                    Based on your facial features and body type,{' '}
                    <span className="font-semibold text-[#84a59d]">
                      {bestRecommendation.title.toLowerCase()}
                    </span>{' '}
                    attire will complement your appearance perfectly.
                  </p>
                  <p className="text-gray-700 font-inter mt-4 leading-relaxed">
                    {bestRecommendation.description}
                  </p>
                </div>
              </div>

              {/* Detailed Analysis Sections */}
              {analysisData && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}>
                  <h3 className="text-2xl font-bold mb-6 font-playfair text-gray-800 border-b border-gray-200 pb-3">
                    Detailed Analysis
                  </h3>

                  {/* Overall Description Section */}
                  <div className="mb-6 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <button
                      className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 text-left font-medium transition-colors hover:bg-gray-100"
                      onClick={() => toggleSection('overall')}>
                      <span className="text-lg font-medium text-gray-800">Overall Description</span>
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
                      <div className="p-6 bg-white">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {getNestedValue(analysisData, ['Your Overall Description']) || 'No overall description available.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Structural Features Section */}
                  <div className="mb-6 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <button
                      className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 text-left font-medium transition-colors hover:bg-gray-100"
                      onClick={() => toggleSection('structural')}>
                      <span className="text-lg font-medium text-gray-800">Structural Features</span>
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
                      <div className="p-6 bg-white">
                        {/* Body Features */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-4 text-lg border-l-4 border-[#84a59d] pl-3">
                            Body Features
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Height and Visual Impression:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Body Features', 'Height and Visual Impression'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Head-to-Body Proportion:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Body Features', 'Head-to-Body Proportion and Visual Effect'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Body Type:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Body Features', 'Body Type and Curve Characteristics'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Body Weight Impression:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Body Features', 'Overall Body Weight Impression'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Shoulder Width:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Body Features', 'Shoulder Width and Head-to-Shoulder Ratio'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Waistline Position:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Body Features', 'Waistline Position and Upper-to-Lower Body Proportion'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Limb Length:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Body Features', 'Limb Length and Visual Proportion'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Limb Thickness:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Body Features', 'Limb Thickness and Line Definition'])}</p>
                            </div>
                          </div>
                        </div>

                        {/* Facial Features */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-4 text-lg border-l-4 border-[#84a59d] pl-3">
                            Facial Features
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Hairstyle Details:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Facial Features', 'Hairstyle Details and Style Characteristics'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Face Shape:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Facial Features', 'Face Shape and Visual Outline'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Facial Structure:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Facial Features', 'Facial Structure and Visual Features'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Facial Contour:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Facial Features', 'Facial Contour and Line Definition'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Neck Length:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Structural Features', 'Facial Features', 'Neck Length and Line Characteristics'])}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Color Features Section */}
                  <div className="mb-6 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <button
                      className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 text-left font-medium transition-colors hover:bg-gray-100"
                      onClick={() => toggleSection('color')}>
                      <span className="text-lg font-medium text-gray-800">Color Features</span>
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
                      <div className="p-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-sm">
                            <span className="font-medium text-gray-800">Skin Tone:</span>
                            <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Color Features', 'Skin Tone and Visual Characteristics'])}</p>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-800">Hair Color:</span>
                            <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Color Features', 'Hair Color and Saturation'])}</p>
                          </div>
                          <div className="text-sm md:col-span-2">
                            <span className="font-medium text-gray-800">Clothing Color Suggestions:</span>
                            <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Color Features', 'Clothing Color Optimization Suggestions'])}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Semantic Features Section */}
                  <div className="mb-6 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <button
                      className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 text-left font-medium transition-colors hover:bg-gray-100"
                      onClick={() => toggleSection('semantic')}>
                      <span className="text-lg font-medium text-gray-800">Semantic Features</span>
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
                      <div className="p-6 bg-white">
                        {/* Intrinsic Features */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-4 text-lg border-l-4 border-[#84a59d] pl-3">
                            Intrinsic Features
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Gender:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Semantic Features', 'Intrinsic Features', 'Gender'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Age Range:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Semantic Features', 'Intrinsic Features', 'Age Range Visual Estimation'])}</p>
                            </div>
                          </div>
                        </div>

                        {/* Temperament Features */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-4 text-lg border-l-4 border-[#84a59d] pl-3">
                            Temperament Features
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Overall Style Impression:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Semantic Features', 'Temperament Features', 'Overall Style First Impression'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Personality Impressions:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Semantic Features', 'Temperament Features', 'Personality Impressions from Expression and Posture'])}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Style Optimization Suggestions:</span>
                              <p className="text-gray-600 mt-1">{getNestedValue(analysisData, ['Semantic Features', 'Temperament Features', 'Style Optimization and Temperament Enhancement Suggestions'])}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>


            {/* Save button - Match style with other sections */}
            <div className="flex justify-end mt-12">
              <button
                onClick={() => router.push('/reportHistory')}
                className="px-6 py-3 bg-[#84a59d] hover:bg-[#6b8c85] text-white font-medium rounded-md transition-colors shadow-md font-inter">
                View history
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <ModernLoadingSpinner
              size="lg"
              message="Loading your recommendations..."
              subMessage="Preparing personalized style suggestions"
            />
          </div>
        )}
      </div>
    </div>
  );
}
