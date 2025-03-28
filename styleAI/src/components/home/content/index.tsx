'use client';
import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CircularGallery from '@/components/ui/CircularGallery';
import BounceCards from '@/components/ui/BounceCards';
import LiquidChrome from '@/components/background/LiquidChrome';

const images = [
  'gallery/outfit1.png',
  'gallery/outfit2.png',
  'gallery/outfit3.png',
  'gallery/outfit4.png',
  'gallery/outfit5.png',
];

const transformStyles = [
  'rotate(5deg) translate(-150px)',
  'rotate(0deg) translate(-70px)',
  'rotate(-5deg)',
  'rotate(5deg) translate(70px)',
  'rotate(-5deg) translate(150px)',
];

const galleryItems = [
  {
    video: "gallery/model1.mp4",
    text: 'Video 1',
  },
  {
    video: "gallery/model2.mp4",
    text: 'Video 1',
  },
  {
    video: "gallery/model3.mp4",
    text: 'Video 1',
  },
  {
    video: "gallery/model4.mp4",
    text: 'Video 1',
  }
];

export function Hero() {
  const router = useRouter();
  const usecaseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartClick = () => {
    router.push('/personalized-recommendation/step1');
  };

  const scrollToUsecase = () => {
    usecaseRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Allow scrolling within container but prevent body scrolling
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Make sure the container can scroll
    if (containerRef.current) {
      containerRef.current.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory no-scrollbar"
    >
      {/* Flowing Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-auto">
        <LiquidChrome
          baseColor={[0.9, 0.9, 0.9]}
          speed={0.2}
          amplitude={0.5}
          frequencyX={3}
          frequencyY={2}
          interactive={true}
        />
        <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
      </div>

      {/* Hero Section - First Screen */}
      <section className="w-screen h-screen flex justify-center items-center snap-start">
        <div className="w-[80%] h-[80%] flex flex-col justify-around translate-y-[5%] bg-white/20 rounded-xl"> 
          {/* Title */}
          <div className="w-[100%] h-[30%]">
            <h1 className="text-center text-5xl font-bold text-[#2D4B37] leading-tight">
              Generate your outfits
              <br />
              Using <span className="text-[#FF9999]">STYLE-AI</span>
            </h1>
          </div>
          {/* Bounce Cards */}
          <div className="w-[100%] h-[50%] flex justify-center items-center">
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
          {/* Scroll Down Button */}
          <div className="w-[100%] h-[15%] flex justify-center">
            <div 
              className="flex flex-col justify-around items-center cursor-pointer group"
              onClick={scrollToUsecase}
            >
              <p className="text-[#2D4B37] font-medium transition-all group-hover:text-[#FF9999]">Explore More</p>
              <div className="animate-bounce transition-transform group-hover:scale-110">
                <Image 
                  src="/doubledown.svg" 
                  alt="Scroll Down" 
                  width={40} 
                  height={40} 
                  className="transition-all group-hover:opacity-80"
                />
              </div>
            </div>
          </div>
        </div> 
      </section>

      {/* Usecase Section - Second Screen */}
      <section
        ref={usecaseRef}
        className="w-screen h-screen flex justify-center items-center snap-start"
      >
        <div className="w-[80%] h-[80%] flex flex-col justify-around translate-y-[5%] bg-white/20 rounded-md">
          {/* Title */}
          <div className="w-[100%] h-[30%]">
            <h2 className="p-5 text-center text-5xl font-bold text-[#2D4B37]">
              Use Cases
            </h2>
            <p className="text-center text-1xl text-gray-600">
              Browse through our collection of fashion styles and find inspiration for your next outfit.
              Our AI will help you create personalized recommendations based on your preferences.
            </p>
          </div>
          {/* Circular Gallery */}
          <div className="w-[100%] h-[50%] flex items-center">
            <CircularGallery 
              items={galleryItems}
              bend={2} 
              textColor="transparent" 
              borderRadius={0.05}
              font="0px var(--font-playfair)"
            />
          </div>
          {/* Start Button */}
          <div className="w-[100%] h-[10%] flex justify-center items-center mb-5">
            <button
              onClick={handleStartClick}
              className="w-20 h-10 bg-black rounded-md hover:bg-gray-800 cursor-pointer transition-colors text-white font-medium">
              Start
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}