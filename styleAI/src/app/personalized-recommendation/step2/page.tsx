'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RecommendationHeader } from '@/components/recommendation/Header';

export default function Step2() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only access sessionStorage in browser environment
    if (typeof window !== 'undefined') {
      // Retrieve the image from session storage
      const storedImage = sessionStorage.getItem('userImage');
      if (!storedImage) {
        // If no image is found, redirect back to step1
        router.push('/personalized-recommendation/step1');
        return;
      }

      setUserImage(storedImage);
    }

    // Here you would typically send the image to your backend for analysis
    // This is just a placeholder for the next step in the process
  }, [router]);

  // Handle next button click
  const handleNextClick = () => {
    // Navigate to the next step
    router.push('/personalized-recommendation/step3');
  };

  return (
    <>
      <RecommendationHeader />
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Analyzing Your Photo
          </h1>

          <div className="max-w-4xl mx-auto">
            {userImage ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md aspect-[3/4] mb-8">
                  <Image
                    src={userImage}
                    alt="Your uploaded image"
                    fill
                    className="object-contain rounded-md"
                  />
                </div>

                <div className="w-full bg-gray-100 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">
                    Analysis in Progress
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We are currently analyzing your photo to provide
                    personalized style recommendations. This process may take a
                    few moments.
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <div className="bg-black h-2.5 rounded-full w-3/4 animate-pulse"></div>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    Please wait while our AI analyzes your facial features and
                    body type to determine the best style recommendations for
                    you.
                  </p>

                  <button
                    onClick={handleNextClick}
                    className="w-full py-3 px-6 rounded-md text-white font-medium bg-black hover:bg-gray-800 transition-colors">
                    Continue to Results
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading your image...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
