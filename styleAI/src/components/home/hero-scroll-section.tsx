'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import Image from 'next/image';
import { Tilt } from '@/components/ui/tilt';
import { Spotlight } from '@/components/ui/spotlight';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function HeroScrollSection() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Handles the explore button click
   * Initiates transition animation and navigates to algorithm gallery
   */
  const handleExploreClick = () => {
    // Start transition animation
    setIsTransitioning(true);

    // Delay navigation to allow for animation
    setTimeout(() => {
      router.push('/algorithmGallery');
    }, 800);
  };

  return (
    <ContainerScroll titleComponent={<></>}>
      <div className="flex flex-col lg:flex-row gap-8 p-6 h-full">
        {/* Left side description */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center pr-0 lg:pr-8">
          <div className="sticky top-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Style-AI Platform
            </h2>
            <p className="text-lg opacity-80 mb-4">
              Our advanced AI-powered styling system combines cutting-edge
              technology with fashion expertise to revolutionize your personal
              style journey.
            </p>
            <p className="opacity-60 mb-8">
              Whether you're looking for outfit recommendations, hair styling
              ideas, or color analysis, our platform provides personalized
              solutions tailored specifically to you.
            </p>
            <button
              onClick={handleExploreClick}
              className="px-8 py-3 bg-black text-white rounded-md hover:bg-black/80 transition-all">
              Explore Features
            </button>
          </div>
        </div>

        {/* Right side feature cards */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Card 1 - Outfit Generator */}
            <FeatureSpotlightCard
              title="Outfit Generator"
              description="Create complete outfits tailored to your style preferences, body type, and occasion."
              mediaFile={`${basePath}/gallery/outfit1.png`}
              isVideo={false}
              iconPath="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"
              iconColor="#3B82F6"
            />

            {/* Feature Card 2 - Hairstyle Recommendations */}
            <FeatureSpotlightCard
              title="Hairstyle Recommendations"
              description="Discover hairstyles that complement your face shape and personal style."
              mediaFile={`${basePath}/gallery/model3.mp4`}
              isVideo={true}
              iconPath="M12 1a7 7 0 00-7 7c0 3.3 2 6 5 7v3h4v-3c3-1 5-3.7 5-7a7 7 0 00-7-7zM8.21 13.89L7 23l5-3 5 3-1.21-9.12"
              iconColor="#EC4899"
            />

            {/* Feature Card 3 - Color Analysis */}
            <FeatureSpotlightCard
              title="Color Analysis"
              description="Find your perfect color palette based on your skin tone, hair, and eye color."
              mediaFile={`${basePath}/gallery/outfit4.png`}
              isVideo={false}
              iconPath="M13.5 4A2.5 2.5 0 0011 6.5 2.5 2.5 0 0013.5 9 2.5 2.5 0 0016 6.5 2.5 2.5 0 0013.5 4M19 12A2 2 0 0017 14 2 2 0 0019 16 2 2 0 0021 14 2 2 0 0019 12M6 13A3 3 0 003 16 3 3 0 006 19 3 3 0 009 16 3 3 0 006 13M12.82 9.72C11.84 8.67 10.47 8 9 8H8.97L9 10C9.89 10 10.73 10.36 11.39 10.97L12.82 9.72M18.31 11.85C17.68 10.76 16.64 10 15.5 10H15.47L15.5 12C16.04 12 16.56 12.31 16.92 12.82L18.31 11.85M6.89 13.77C5.33 14 4 15 3.13 16.39L4.96 17.6C5.58 16.6 6.72 16 8 16L6.89 13.77Z"
              iconColor="#8B5CF6"
            />

            {/* Feature Card 4 - Virtual Try-On */}
            <FeatureSpotlightCard
              title="Virtual Try-On"
              description="See yourself in recommended styles before making any changes."
              mediaFile={`${basePath}/gallery/model2.mp4`}
              isVideo={true}
              iconPath="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
              iconColor="#10B981"
            />
          </div>
        </div>
      </div>
    </ContainerScroll>
  );
}

// Types for the card components
interface SpotlightCardProps {
  title: string;
  description: string;
  mediaFile: string;
  isVideo: boolean;
  iconPath: string;
  iconColor: string;
}

// Feature card with spotlight effect
function FeatureSpotlightCard({
  title,
  description,
  mediaFile,
  isVideo,
  iconPath,
  iconColor,
}: SpotlightCardProps) {
  return (
    <div className="h-full w-full flex flex-col">
      <Tilt
        rotationFactor={6}
        isRevese
        style={{
          transformOrigin: 'center center',
        }}
        springOptions={{
          stiffness: 26.7,
          damping: 4.1,
          mass: 0.2,
        }}
        className="group relative rounded-xl h-full w-full">
        <Spotlight
          className="z-10 from-white/40 via-white/25 to-white/10 blur-2xl"
          size={250}
          springOptions={{
            stiffness: 26.7,
            damping: 4.1,
            mass: 0.2,
          }}
        />
        <div className="bg-white/20 backdrop-blur-md border border-white/10 p-6 rounded-xl h-full flex flex-col">
          <div className="flex items-start mb-4">
            <div
              className="bg-[color:var(--icon-bg)] p-3 rounded-full w-fit mr-3"
              style={{ '--icon-bg': `${iconColor}15` } as React.CSSProperties}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d={iconPath} />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-sm text-gray-700 mt-1">{description}</p>
            </div>
          </div>
          <div className="mt-auto rounded-lg overflow-hidden flex-grow">
            {isVideo ? (
              <video
                src={mediaFile}
                autoPlay
                loop
                muted
                className="w-full h-[200px] object-cover grayscale-[50%] duration-700 group-hover:grayscale-0"
              />
            ) : (
              <Image
                src={mediaFile}
                alt={title}
                width={400}
                height={300}
                className="w-full h-[200px] object-cover grayscale-[50%] duration-700 group-hover:grayscale-0"
              />
            )}
          </div>
        </div>
      </Tilt>
    </div>
  );
}
