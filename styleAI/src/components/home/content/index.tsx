'use client';
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CircularGallery from '@/components/ui/CircularGallery';
import BounceCards from '@/components/ui/BounceCards';
import LiquidChrome from '@/components/background/LiquidChrome';
import { useAuth, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

const images = [
  basePath + '/gallery/outfit1.png',
  basePath + '/gallery/outfit2.png',
  basePath + '/gallery/outfit3.png',
  basePath + '/gallery/outfit4.png',
  basePath + '/gallery/outfit5.png',
];

const galleryItems = [
  {
    video: basePath + '/gallery/model1.mp4',
    text: 'Model 1',
  },
  {
    video: basePath + '/gallery/model2.mp4',
    text: 'Model 2',
  },
  {
    video: basePath + '/gallery/model3.mp4',
    text: 'Model 3',
  },
  {
    video: basePath + '/gallery/model4.mp4',
    text: 'Model 4',
  },
];

const doubleDownPath = `${basePath}/doubledown.svg`;

const transformStyles = [
  'rotate(5deg) translate(-150px)',
  'rotate(0deg) translate(-70px)',
  'rotate(-5deg)',
  'rotate(5deg) translate(70px)',
  'rotate(-5deg) translate(150px)',
];

export function Hero() {
  const router = useRouter();
  const usecaseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isSignedIn } = useAuth();

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  /**
   * Handles the start button click for signed-in users
   * Initiates transition animation and navigates to algorithm gallery
   */
  const handleStartClick = () => {
    // Start transition animation
    setIsTransitioning(true);

    // Delay navigation to allow for animation
    setTimeout(() => {
      router.push('/algorithmGallery');
    }, 800);
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
    <motion.div
      ref={containerRef}
      className="w-screen h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory no-scrollbar"
      initial="initial"
      animate={isTransitioning ? 'exit' : 'animate'}
      variants={pageVariants}
      transition={{ duration: 0.5 }}>
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
            <h1 className="text-center text-5xl fFont-bold text-[#2D4B37] leading-tight">
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
              onClick={scrollToUsecase}>
              <p className="text-[#2D4B37] font-medium transition-all group-hover:text-[#FF9999]">
                Explore More
              </p>
              <div className="animate-bounce transition-transform group-hover:scale-110">
                <Image
                  src={doubleDownPath}
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
        className="w-screen h-screen flex justify-center items-center snap-start">
        <div className="w-[80%] h-[80%] flex flex-col justify-around translate-y-[5%] bg-white/20 rounded-md">
          {/* Title */}
          <div className="w-[100%] h-[30%]">
            <h2 className="p-5 text-center text-5xl font-bold text-[#2D4B37]">
              Use Cases
            </h2>
            <p className="text-center text-1xl text-gray-600">
              Browse through our collection of fashion styles and find
              inspiration for your next outfit. Our AI will help you create
              personalized recommendations based on your preferences.
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
          {/* Start/Sign In Button */}
          <div className="w-[100%] h-[10%] flex justify-center items-center mb-5">
            <SignedIn>
              <button
                onClick={handleStartClick}
                className="px-6 py-2.5 bg-[#2D4B37] text-white rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-base">
                Start
              </button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 bg-[#2D4B37] text-white rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-base">
                  Try it now!
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
