'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/personalized-recommendation/step1');
  };

  return (
    <main className="bg-white min-h-screen pt-20">
      <div className="container mx-auto px-4 py-16 max-w-6xl text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2D4B37] mb-8 leading-tight">
            Generate your outfits
            <br />
            Using <span className="text-[#FF9999]">STYLE-AI</span>
          </h1>
          <button
            className="bg-black text-white px-12 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors"
            onClick={handleStartClick}>
            Start
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-0 md:px-8">
          {/* You can add images here if needed */}
        </div>
      </div>
    </main>
  );
}
