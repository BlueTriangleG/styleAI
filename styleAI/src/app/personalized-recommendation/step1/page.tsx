'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RecommendationHeader } from '@/components/recommendation/Header';

export default function Step1() {
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle next button click
  const handleNextClick = () => {
    if (image) {
      // Store the image in session storage or state management
      if (typeof window !== 'undefined') {
        // Only access sessionStorage in browser environment
        sessionStorage.setItem('userImage', image);
      }
      // Navigate to the next step
      router.push('/personalized-recommendation/step2');
    }
  };

  return (
    <>
      <RecommendationHeader />
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-10 text-left">
            Upload Your Photo
          </h1>

          <div
            className="flex flex-col md:flex-row gap-8"
            style={{ minHeight: 'calc(100vh - 200px)' }}>
            {/* Left side - Upload area */}
            <div
              className="w-full md:w-1/2 bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center"
              style={{ minHeight: 'calc(100vh - 200px)' }}>
              {image ? (
                <div
                  className="relative w-full h-full"
                  style={{ minHeight: 'calc(100vh - 250px)' }}>
                  <Image
                    src={image}
                    alt="Uploaded image"
                    fill
                    className="object-contain rounded-md"
                  />
                  <button
                    onClick={handleUploadClick}
                    className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    Change Photo
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleUploadClick}
                  className="w-full bg-gray-200 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                  style={{ minHeight: 'calc(100vh - 250px)' }}>
                  {isUploading ? (
                    <p className="text-gray-600">Uploading...</p>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-xl font-semibold text-gray-700 mb-2 uppercase">
                        Upload your image here
                      </p>
                      <p className="text-sm text-gray-500">
                        Click to browse files
                      </p>
                    </>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Right side - Instructions */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="bg-white p-6 rounded-lg flex-grow">
                <h2 className="text-2xl font-bold mb-6">
                  What you should do now:
                </h2>

                <p className="text-gray-700 mb-6">
                  Upload a clear half, or full body picture to us. You can wear
                  cloth, but make sure your face is clear and do not wearing too
                  loose cloths.
                </p>

                <p className="text-gray-700 mb-8">
                  When you satisfy with your picture, press next for next stage.
                </p>

                <h2 className="text-2xl font-bold mb-6">What we will do:</h2>

                <p className="text-gray-700 mb-6">
                  We will analyze your picture and using our advanced AI to give
                  you a detailed analysis on your face.
                </p>

                <p className="text-gray-700">
                  With these analysis, we can do deep and customized analysis on
                  for you, then you can find the best fit suit in different
                  scenarios.
                </p>
              </div>

              <button
                onClick={handleNextClick}
                disabled={!image}
                className={`w-full py-3 px-6 rounded-md text-white font-medium mt-4 ${
                  image
                    ? 'bg-[#8C9DAE] hover:bg-[#7A8A9A]'
                    : 'bg-gray-400 cursor-not-allowed'
                } transition-colors`}>
                Next Stage
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
