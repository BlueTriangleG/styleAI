'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

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

              <div
                className={`flex ${
                  isMobile ? 'flex-col' : 'flex-row'
                } gap-6 md:gap-8`}>
                {/* Left Side - Comparison Images with Arrow */}
                <div
                  className={`${isMobile ? 'w-full' : 'w-2/3'} flex ${
                    isMobile ? 'flex-col' : 'flex-row'
                  } items-center gap-2 md:gap-4 relative`}>
                  {/* User Uploaded Image */}
                  <div
                    className={`${
                      isMobile ? 'w-full h-[60vh]' : 'w-1/2 aspect-[9/16]'
                    } bg-white/60 backdrop-blur-xs rounded-lg overflow-hidden shadow-md relative`}>
                    <div className="absolute inset-0 p-1">
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

                  {/* Arrow - Responsive placement */}
                  <div
                    className={`${
                      isMobile ? 'rotate-90 my-2' : ''
                    } flex justify-center items-center`}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-gray-700"
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

                  {/* Best Fit Image */}
                  <div
                    className={`${
                      isMobile ? 'w-full h-[60vh]' : 'w-1/2 aspect-[9/16]'
                    } bg-white/60 backdrop-blur-xs rounded-lg overflow-hidden relative`}>
                    <div className="absolute inset-0 p-1 border-2 border-blue-400 rounded-lg shadow-lg">
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

                {/* Right Description */}
                <div
                  className={`${
                    isMobile ? 'w-full' : 'w-1/3'
                  } bg-white/60 backdrop-blur-xs p-6 rounded-lg shadow-md`}>
                  <h3 className="text-xl font-bold mb-4 font-playfair text-gray-800 border-b border-gray-200 pb-2">
                    Style Recommendation
                  </h3>
                  <p className="text-gray-800 font-inter">
                    Based on your facial features and body type,{' '}
                    {bestRecommendation.title.toLowerCase()} attire will
                    complement your appearance perfectly.{' '}
                    {bestRecommendation.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-12 border-gray-200" />

            {/* Recommendations for Different Occasions */}
            <div>
              <h2 className="text-2xl font-bold mb-8 font-playfair text-gray-800 border-b border-gray-200 pb-2">
                Recommendation suits for different environment
              </h2>

              <div className="bg-white/60 backdrop-blur-xs rounded-lg p-8 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {styleRecommendations.map((style, index) => (
                    <ZoomableCard
                      key={index}
                      imageUrl={style.examples && style.examples[0]}
                      title={style.title}
                      description={style.description}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Save button - Match style with other sections */}
            <div className="flex justify-end mt-12">
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
