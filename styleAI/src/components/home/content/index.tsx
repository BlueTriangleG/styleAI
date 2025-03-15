'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CircularGallery from '@/components/ui/CircularGallery';
import BounceCards from '@/components/ui/BounceCards';

const images = [
  "https://picsum.photos/400/400?grayscale",
  "https://picsum.photos/500/500?grayscale",
  "https://picsum.photos/600/600?grayscale",
  "https://picsum.photos/700/700?grayscale",
  "https://picsum.photos/300/300?grayscale"
];

const transformStyles = [
  "rotate(5deg) translate(-150px)",
  "rotate(0deg) translate(-70px)",
  "rotate(-5deg)",
  "rotate(5deg) translate(70px)",
  "rotate(-5deg) translate(150px)"
];

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
          
          <div className="flex justify-center mb-8">
            <BounceCards
              className="custom-bounceCards"
              images={images}
              containerWidth={500}
              containerHeight={250}
              animationDelay={1}
              animationStagger={0.08}
              easeType="elastic.out(1, 0.5)"
              transformStyles={transformStyles}
              enableHover={true}
            />
          </div>
          
          <button
            className="bg-black text-white px-12 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors"
            onClick={handleStartClick}>
            Start
          </button>
        </div>
      </div>
    </main>
  );
}
