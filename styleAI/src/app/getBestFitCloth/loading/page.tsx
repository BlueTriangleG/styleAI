'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RecommendationHeader } from '@/components/recommendation/Header';
import LiquidChrome from '@/components/Background/LiquidChrome';
import { CleanLoadingOverlay } from '@/components/loading/CleanLoadingOverlay';
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
  const [currentStage, setCurrentStage] = useState('upload');
  const jobCreatedRef = useRef<boolean>(false);
  const apiVerifiedRef = useRef<boolean>(false);
  const [isApiVerified, setIsApiVerified] = useState(false);

  // Loading stages for UI
  const loadingStages = [
    {
      id: 'upload',
      title: 'Processing Upload',
      description: 'Analyzing your uploaded image',
      icon: 'upload' as const,
      estimatedDuration: 2000,
    },
    {
      id: 'api-connect',
      title: 'AI Connection',
      description: 'Connecting to analysis servers',
      icon: 'api-connect' as const,
      estimatedDuration: 1500,
    },
    {
      id: 'analysis',
      title: 'Deep Analysis', 
      description: 'AI analyzing your style features',
      icon: 'analysis' as const,
      estimatedDuration: 4000,
    },
    {
      id: 'recommendations',
      title: 'Style Matching',
      description: 'Generating personalized recommendations',
      icon: 'recommendations' as const,
      estimatedDuration: 2500,
    },
    {
      id: 'finalize',
      title: 'Final Touches',
      description: 'Preparing your complete report',
      icon: 'finalize' as const,
      estimatedDuration: 1000,
    },
  ];

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
      setCurrentStage('api-connect');
      const data = await apiService.getPersonalizedAnalysis(jobId);
      console.log('API connection verified:', data);

      if (data.status === 'success') {
        // Mark API as verified
        setIsApiVerified(true);
        apiVerifiedRef.current = true;
        return true;
      } else {
        console.error('API verification failed:', data);
        // Redirect to step1 on API failure
        router.replace('/getBestFitCloth');
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
      setCurrentStage('analysis');
      
      // Create job record - this returns a string (jobId) not an object
      const newJobId = await apiService.createJob(imageData);
      console.log(`Job created successfully, ID: ${newJobId}`);

      // Store job ID (only) for reference
      setJobId(newJobId);
      sessionStorage.setItem('currentJobId', newJobId);

      // Verify API connectivity
      setCurrentStage('recommendations');
      await verifyApiConnection(newJobId);
    } catch (error) {
      console.error('Job creation failed:', error);
      throw error;
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
          router.replace('/getBestFitCloth');
          return;
        }

        setUserImageExists(true);

        // Create job and verify API
        createJobAndVerifyApi(userImage);
      } catch (error) {
        console.error('Error accessing session storage:', error);
        router.replace('/getBestFitCloth');
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

        // If progress reaches 100% and API is verified, transition to generateReport
        if (newProgress >= 100 && apiVerifiedRef.current) {
          console.log(
            'Loading complete and API verified, preparing transition to generateReport'
          );
          clearInterval(interval);
          setCurrentStage('finalize');
          // Start transition animation
          setIsTransitioning(true);

          // Delay navigation to ensure animation displays properly
          setTimeout(() => {
            console.log('Navigating to generateReport');
            router.replace('/getBestFitCloth/generateReport');
          }, 1000);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <RecommendationHeader />
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <LiquidChrome
            baseColor={[0.9, 0.95, 0.98]}
            speed={0.2}
            amplitude={0.5}
            frequencyX={3}
            frequencyY={2}
            interactive={false}
          />
        </div>

        {/* Clean loading overlay */}
        <CleanLoadingOverlay
          isVisible={!isTransitioning}
          currentStage={currentStage}
          progress={progress}
          stages={loadingStages}
          onComplete={() => {
            setIsTransitioning(true);
            setTimeout(() => {
              router.replace('/getBestFitCloth/generateReport');
            }, 500);
          }}
          title="StyleAI Processing"
          subtitle="Creating your personalized style analysis"
          theme="light"
        />
      </div>

      {/* Transition animation */}
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 bg-white z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Debug info (development mode) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div>Stage: {currentStage}</div>
          <div>Progress: {Math.round(progress)}%</div>
          <div>JobID: {jobId || 'N/A'}</div>
          <div>API Verified: {isApiVerified ? 'Yes' : 'No'}</div>
          <div>Image: {userImageExists ? 'Found' : 'Not Found'}</div>
        </motion.div>
      )}
    </>
  );
}