'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Step3() {
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
  }, [router]);

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Your Style Recommendations
        </h1>

        <div className="max-w-6xl mx-auto">
          {userImage ? (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <div className="sticky top-24">
                  <div className="relative w-full aspect-[3/4] mb-4">
                    <Image
                      src={userImage}
                      alt="Your uploaded image"
                      fill
                      className="object-contain rounded-md border border-gray-200"
                    />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="font-bold text-lg mb-2">Your Analysis</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Face Shape:</span>
                        <span className="font-medium">Oval</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Skin Tone:</span>
                        <span className="font-medium">Warm</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Body Type:</span>
                        <span className="font-medium">Athletic</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Style Match:</span>
                        <span className="font-medium">Business Casual</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                  <h2 className="text-2xl font-bold mb-4">
                    Recommended Styles
                  </h2>

                  <div className="space-y-6">
                    <div className="border-b pb-6">
                      <h3 className="text-xl font-semibold mb-3">
                        Business Casual
                      </h3>
                      <p className="text-gray-700 mb-4">
                        Based on your facial features and body type, business
                        casual attire will complement your appearance perfectly.
                        Focus on well-fitted blazers, button-down shirts, and
                        tailored pants.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 1</span>
                        </div>
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 2</span>
                        </div>
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 3</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-6">
                      <h3 className="text-xl font-semibold mb-3">
                        Smart Casual
                      </h3>
                      <p className="text-gray-700 mb-4">
                        For a more relaxed yet polished look, smart casual
                        options would work well with your features. Consider
                        premium t-shirts, chinos, and casual jackets.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 1</span>
                        </div>
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 2</span>
                        </div>
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 3</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Formal Wear
                      </h3>
                      <p className="text-gray-700 mb-4">
                        For special occasions, your features would be enhanced
                        by well-tailored suits in navy or charcoal. Consider
                        slim-fit designs with subtle patterns.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 1</span>
                        </div>
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 2</span>
                        </div>
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">Style Example 3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() =>
                      router.push('/personalized-recommendation/step2')
                    }
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors">
                    Back to Analysis
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors">
                    Save Recommendations
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading your recommendations...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
