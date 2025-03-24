'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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
}

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
}: StyleRecommendationsProps) {
  const router = useRouter();

  // Get the first recommendation as the best recommendation
  const bestRecommendation = styleRecommendations[0];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center font-playfair text-gray-800">
          Your Style Recommendations
        </h1>

        {userImage ? (
          <div className="max-w-6xl mx-auto">
            {/* Best Recommendation Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 font-playfair text-gray-800">
                Your best fit recommendation
              </h2>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Image - User Uploaded Image */}
                <div className="w-full md:w-1/3 relative">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md">
                    {userImage ? (
                      <Image
                        src={userImage}
                        alt="Your uploaded image"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-inter">
                          Your Image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow - On the right side */}
                  <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Middle Image - Best Fit Image */}
                <div className="w-full md:w-1/3 relative">
                  <div className="aspect-[3/4] h-[50vh] rounded-lg overflow-hidden border-2 border-blue-400 shadow-lg">
                    {isLoadingBestFit ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-12 h-12 text-[#84a59d] animate-spin-slow mb-4"
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
                          <span className="text-gray-500 font-inter">
                            Loading...
                          </span>
                        </div>
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
                          <span className="text-red-500 font-inter">
                            {bestFitError}
                          </span>
                          <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : bestFitImage ? (
                      <Image
                        src={bestFitImage}
                        alt="Best fit style"
                        fill
                        className="object-cover"
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

                {/* Right Description */}
                <div className="w-full md:w-1/3">
                  <p className="text-gray-800 font-inter mb-4">
                    {bestRecommendation.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-8 border-gray-200" />

            {/* Recommendations for Different Occasions */}
            <div>
              <h2 className="text-2xl font-bold mb-8 font-playfair text-gray-800">
                Recommendation suits for different environment
              </h2>

              <div className="bg-gray-100 rounded-lg p-8">
                <h3 className="text-xl font-bold mb-6 text-center font-playfair text-gray-800">
                  Recommend style
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {styleRecommendations.map((style, index) => (
                    <div key={index} className="bg-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2 text-center font-playfair text-gray-800">
                        {style.title}
                      </h4>
                      <div className="aspect-[3/4] bg-gray-300 rounded-md flex items-center justify-center">
                        <span className="text-gray-500 font-inter">
                          Style Example
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analysis Results - Hidden (Moved to sidebar or bottom) */}
            <div className="hidden">
              <h3 className="text-xl font-bold mb-4 font-playfair text-gray-800">
                Your Analysis
              </h3>
              <div className="space-y-2 font-inter">
                <div className="flex justify-between">
                  <span className="text-gray-600">Face Shape:</span>
                  <span className="font-medium text-right">
                    {analysisResults.faceShape}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skin Tone:</span>
                  <span className="font-medium text-right">
                    {analysisResults.skinTone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Body Type:</span>
                  <span className="font-medium text-right">
                    {analysisResults.bodyType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Style Match:</span>
                  <span className="font-medium text-right">
                    {analysisResults.styleMatch}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-[#84a59d] hover:bg-[#6b8c85] text-white font-medium rounded-md transition-colors shadow-md font-inter">
                Save Recommendations
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-[#84a59d] animate-spin-slow mb-4"
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
              <p className="text-gray-500 font-inter">
                Loading your recommendations...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
