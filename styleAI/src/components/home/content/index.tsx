'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CircularGallery from '@/components/ui/CircularGallery';
import BounceCards from '@/components/ui/BounceCards';
import { useRef, useEffect } from 'react';

const images = [
  "gallery/outfit1.png",
  "gallery/outfit2.png",
  "gallery/outfit3.png",
  "gallery/outfit4.png",
  "gallery/outfit1.png",
];

const transformStyles = [
  "rotate(5deg) translate(-150px)",
  "rotate(0deg) translate(-70px)",
  "rotate(-5deg)",
  "rotate(5deg) translate(70px)",
  "rotate(-5deg) translate(150px)"
];

// Gallery items for CircularGallery
const galleryItems = [
  {
    image: "gallery/outfit1.png",
    text: ""
  },
  {
    image: "gallery/outfit2.png",
    text: ""
  },
  {
    image: "gallery/outfit3.png",
    text: ""
  },
  {
    image: "gallery/outfit4.png",
    text: ""
  },
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

  // Prevent body scrolling when this component is mounted
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth no-scrollbar"
    >
      {/* Hero Section - First Screen */}
      <section className="bg-white h-screen w-screen flex items-center justify-center snap-start">
        <div className="w-screen mx-auto px-8 md:px-16 text-center pt-16">
          <div>
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
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                className="bg-black text-white px-12 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors"
                onClick={handleStartClick}>
                Start
              </button>
              
              <button
                className="bg-transparent text-[#2D4B37] px-6 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors border border-[#2D4B37]"
                onClick={scrollToUsecase}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Usecase Section - Second Screen */}
      <section 
        ref={usecaseRef}
        className="bg-[#F8F9FA] h-screen w-screen flex flex-col items-center snap-start"
      >
        <div className="w-screen mx-auto px-8 md:px-16 py-4 mt-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D4B37] mb-4 text-center">
            Use Cases
          </h2>
          <p className="text-gray-600 text-center max-w-4xl mx-auto mb-8">
            Browse through our collection of fashion styles and find inspiration for your next outfit. Our AI will help you create personalized recommendations based on your preferences.
          </p>
          
          <div className="flex justify-center items-center" style={{ height: '500px', width: '100%', margin: '0 auto' }}>
            <CircularGallery 
              items={galleryItems}
              bend={4} 
              textColor="transparent" 
              borderRadius={0.05}
              font="0px var(--font-playfair)"
            />
          </div>
          {/* <div className="mt-8 text-center">
            <button
              className="bg-black text-white px-12 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors"
              onClick={handleStartClick}>
              Get Started
            </button>
          </div> */}
        </div>
      </section>
    </div>
  );
}
