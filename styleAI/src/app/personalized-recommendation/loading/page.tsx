'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RecommendationHeader } from '@/components/recommendation/Header';
import LiquidChrome from '@/components/background/LiquidChrome';

import { apiService } from '@/lib/api/ApiService';

/**
 * Loading Page Component
 *
 * Displays a loading animation while verifying API connections and job creation.
 * Transitions to the recommendation page after successful verification.
 *
 * @returns {JSX.Element} Rendered component
 */
export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userImageExists, setUserImageExists] = useState<boolean | null>(null);
  const [jobId, setJobId] = useState<string>('');
  const jobCreatedRef = useRef<boolean>(false);
  const apiVerifiedRef = useRef<boolean>(false);
  const [isApiVerified, setIsApiVerified] = useState(false);

  /**
   * Verifies the API connection and data availability
   * Does not store data in session storage, just confirms the API works
   *
   * @param {string} jobId - The job ID to verify
   * @returns {Promise<boolean>} Whether the API verification was successful
   */
  const verifyApiConnection = async (jobId: string) => {
    // If already verified, return immediately
    if (apiVerifiedRef.current) {
      console.log('API already verified, skipping verification');
      return true;
    }

    try {
      console.log('Verifying API connectivity...');
      const data = await apiService.getPersonalizedAnalysis(jobId);
      console.log('API connection verified:', data);

      if (data.status === 'success') {
        try {
          // Verify suit pictures API
          const suitPicturesResult = await apiService.getWearSuitPictures(
            jobId
          );
          console.log(
            'Suit pictures API verified:',
            suitPicturesResult.status === 'success'
          );

          // Verify best fit image API
          try {
            const bestFitResult = await apiService.getBestFitImage(jobId);
            console.log(
              'Best fit image API verified:',
              bestFitResult &&
                bestFitResult.status === 'success' &&
                !!bestFitResult.imageData
            );
          } catch (bestFitError) {
            console.error(
              'Best fit image API verification failed:',
              bestFitError
            );
            // Continue even if this specific API fails
          }
        } catch (suitPicturesError) {
          console.error(
            'Suit pictures API verification failed:',
            suitPicturesError
          );
          // Continue even if this specific API fails
        }

        // Mark API as verified
        setIsApiVerified(true);
        apiVerifiedRef.current = true;
        return true;
      } else {
        console.error('API verification failed:', data);
        // Redirect to step1 on API failure
        router.replace('/personalized-recommendation/step1');
        return false;
      }
    } catch (error) {
      console.error('API verification failed with error:', error);
      // Mark API as verified anyway to proceed with flow
      setIsApiVerified(true);
      apiVerifiedRef.current = true;
      return false;
    }
  };

  /**
   * Creates a job and verifies API connection
   * Only verifies connectivity without storing data
   *
   * @param {string} imageData - Base64 image data from the user
   */
  const createJobAndVerifyApi = async (imageData: string) => {
    // Prevent duplicate job creation
    if (jobCreatedRef.current) {
      console.log('Job already created, skipping creation');
      return;
    }

    // Mark job as created to prevent duplicate calls
    jobCreatedRef.current = true;

    try {
      console.log('Creating job record...');
      // Create job record
      const newJobId = await apiService.createJob(imageData);
      console.log(`Job created successfully, ID: ${newJobId}`);

      // Store job ID (only) for reference
      setJobId(newJobId);
      sessionStorage.setItem('currentJobId', newJobId);

      // Verify API connectivity
      await verifyApiConnection(newJobId);
    } catch (error) {
      console.error('Job creation failed:', error);
      // Generate temporary job ID if creation fails
      const tempJobId = `temp-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      console.log(`Using temporary job ID: ${tempJobId}`);
      setJobId(tempJobId);
      sessionStorage.setItem('currentJobId', tempJobId);

      // Verify API with temporary ID
      await verifyApiConnection(tempJobId);
    }
  };

  useEffect(() => {
    console.log('Loading page component mounted');

    // Check if user image exists
    if (typeof window !== 'undefined') {
      try {
        const userImage = sessionStorage.getItem('userImage');
        console.log(
          'Image from session storage:',
          userImage ? 'exists' : 'not found'
        );

        if (!userImage) {
          console.log('User image not found, redirecting to step1');
          setUserImageExists(false);
          router.replace('/personalized-recommendation/step1');
          return;
        }

        setUserImageExists(true);

        // Create job and verify API
        createJobAndVerifyApi(userImage);
      } catch (error) {
        console.error('Error accessing session storage:', error);
        router.replace('/personalized-recommendation/step1');
        return;
      }
    }

    // Simulate loading progress
    console.log('Starting progress simulation');
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 5;
        console.log(
          'Current progress:',
          Math.min(newProgress, 100).toFixed(1) + '%'
        );

        // If progress reaches 100% and API is verified, transition to step2
        if (newProgress >= 100 && apiVerifiedRef.current) {
          console.log(
            'Loading complete and API verified, preparing transition to step2'
          );
          clearInterval(interval);
          // Start transition animation
          setIsTransitioning(true);

          // Delay navigation to ensure animation displays properly
          setTimeout(() => {
            console.log('Navigating to step2');
            router.replace('/personalized-recommendation/step2');
          }, 100);
          return 100;
        }

        // Hold at 95% if API not yet verified
        if (newProgress >= 95 && !apiVerifiedRef.current) {
          console.log('Progress at 95%, waiting for API verification...');
          return 95;
        }

        return Math.min(newProgress, 100);
      });
    }, 400);

    return () => {
      console.log('Loading page component unmounting, clearing interval');
      clearInterval(interval);
    };
  }, [router]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        when: 'afterChildren',
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  // Simple loading indicator if userImageExists is null or false
  if (userImageExists === null || userImageExists === false) {
    return (
      <>
        <RecommendationHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-[#84a59d] animate-spin-slow mb-4"
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
            <p className="text-gray-600 font-inter">
              {userImageExists === false
                ? 'Redirecting to upload page...'
                : 'Loading...'}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RecommendationHeader />
      {/* Flowing background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <LiquidChrome
          baseColor={[0.9, 0.9, 0.9]}
          speed={0.3}
          amplitude={0.7}
          frequencyX={4}
          frequencyY={3}
          interactive={true}
        />
        <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
      </div>
      <motion.div
        className="min-h-screen pt-20 relative"
        initial="initial"
        animate={isTransitioning ? 'exit' : 'animate'}
        variants={pageVariants}>
        {/* Content area */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto flex flex-col items-center justify-center"
            initial="initial"
            animate="animate"
            variants={containerVariants}>
            <motion.div className="mb-8 text-center" variants={itemVariants}>
              <h1 className="text-3xl font-bold mb-2 font-playfair text-gray-800">
                Analyzing Your Style
              </h1>
              <p className="text-lg text-gray-600 font-inter">
                We're processing your photo to create personalized
                recommendations
              </p>
            </motion.div>

            <motion.div className="w-full mb-8" variants={itemVariants}>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-[#84a59d] h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-right text-sm text-gray-600 font-inter">
                {Math.min(Math.round(progress), 100)}%
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              variants={itemVariants}>
              {/* Stylish loading spinner with color accent */}
              <div className="relative w-32 h-32 mb-6">
                {/* Outer rotating ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-gray-200"
                  style={{ borderRadius: '50%' }}
                />

                {/* Inner animated arc */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: '#84a59d',
                    borderRadius: '50%',
                    transform: `rotate(${progress * 3.6}deg)`,
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Percentage display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-2xl font-medium text-gray-700">
                    {Math.min(Math.round(progress), 100)}%
                  </p>
                </div>
              </div>

              {/* Fashion silhouette morphing animation */}
              <motion.div
                className="mb-4 h-16 w-16 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}>
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-[#84a59d]">
                  <motion.path
                    fill="currentColor"
                    d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M7,10L12,15L17,10H7Z"
                    animate={{
                      d: [
                        'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M7,10L12,15L17,10H7Z',
                        'M21,16V8H10M10,8A2,2 0 0,1 12,10V14A2,2 0 0,1 10,16A2,2 0 0,1 8,14V10A2,2 0 0,1 10,8M12,4.8C12,4.8 14,6 14,8C14,10 12,11.2 12,11.2M16,7A2,2 0 0,1 18,9A2,2 0 0,1 16,11A2,2 0 0,1 14,9A2,2 0 0,1 16,7Z',
                        'M12,12A3,3 0 0,0 9,15C9,16.3 9.84,17.4 11,17.82V20H9V22H15V20H13V17.82C14.16,17.4 15,16.3 15,15A3,3 0 0,0 12,12M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22H20A2,2 0 0,0 22,20V12A10,10 0 0,0 12,2Z',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                </svg>
              </motion.div>

              {/* Status text with typographic animation */}
              <motion.p
                className="text-gray-700 font-inter text-lg text-center mb-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}>
                Analyzing your unique style profile
              </motion.p>

              {/* Analysis steps with animated progress */}
              <ul className="text-gray-600 space-y-1 font-inter max-w-xs">
                <motion.li
                  className="flex items-center space-x-2"
                  animate={{
                    color: progress >= 25 ? '#84a59d' : '#718096',
                  }}
                  transition={{ duration: 0.5 }}>
                  <motion.span
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-white rounded-full"
                    animate={{
                      backgroundColor: progress >= 25 ? '#84a59d' : 'white',
                      color: progress >= 25 ? 'white' : '#718096',
                    }}>
                    {progress >= 25 ? '✓' : '·'}
                  </motion.span>
                  <span>Analyzing facial features</span>
                </motion.li>

                <motion.li
                  className="flex items-center space-x-2"
                  animate={{
                    color: progress >= 50 ? '#84a59d' : '#718096',
                  }}>
                  <motion.span
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-white rounded-full"
                    animate={{
                      backgroundColor: progress >= 50 ? '#84a59d' : 'white',
                      color: progress >= 50 ? 'white' : '#718096',
                    }}>
                    {progress >= 50 ? '✓' : '·'}
                  </motion.span>
                  <span>Determining style preferences</span>
                </motion.li>

                <motion.li
                  className="flex items-center space-x-2"
                  animate={{
                    color: progress >= 75 ? '#84a59d' : '#718096',
                  }}>
                  <motion.span
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-white rounded-full"
                    animate={{
                      backgroundColor: progress >= 75 ? '#84a59d' : 'white',
                      color: progress >= 75 ? 'white' : '#718096',
                    }}>
                    {progress >= 75 ? '✓' : '·'}
                  </motion.span>
                  <span>Identifying style characteristics</span>
                </motion.li>

                <motion.li
                  className="flex items-center space-x-2"
                  animate={{
                    color: progress >= 90 ? '#84a59d' : '#718096',
                  }}>
                  <motion.span
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-white rounded-full"
                    animate={{
                      backgroundColor: progress >= 90 ? '#84a59d' : 'white',
                      color: progress >= 90 ? 'white' : '#718096',
                    }}>
                    {progress >= 90 ? '✓' : '·'}
                  </motion.span>
                  <span>Generating personalized recommendations</span>
                </motion.li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
