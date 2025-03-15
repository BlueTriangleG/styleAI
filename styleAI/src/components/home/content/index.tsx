'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CircularGallery from '@/components/ui/CircularGallery';
import BounceCards from '@/components/ui/BounceCards';
import { useRef, useEffect } from 'react';

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

// Sample use cases for the application
const useCases = [
  {
    title: "Personal Style Analysis",
    description: "Upload your photo and get a detailed analysis of your body shape, color palette, and style preferences.",
    icon: "👕"
  },
  {
    title: "AI Outfit Generation",
    description: "Generate personalized outfit recommendations based on your style profile and preferences.",
    icon: "👗"
  },
  {
    title: "Seasonal Wardrobe Planning",
    description: "Plan your seasonal wardrobe with AI-powered recommendations for upcoming trends and weather conditions.",
    icon: "🧣"
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
        <div className="container mx-auto px-4 text-center pt-16">
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
        className="bg-[#F8F9FA] h-screen w-screen flex items-center justify-center snap-start"
      >
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D4B37] mb-12 text-center">
            How <span className="text-[#FF9999]">STYLE-AI</span> Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-2xl font-bold text-[#2D4B37] mb-3">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button
              className="bg-black text-white px-12 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors"
              onClick={handleStartClick}>
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
