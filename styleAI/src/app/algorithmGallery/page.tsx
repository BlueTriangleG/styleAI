'use client';

/**
 * AlgorithmGallery page component
 *
 * A page that displays a horizontally scrollable gallery of algorithms
 * for users to select from and proceed with their style analysis.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RecommendationHeader } from '@/components/recommendation/Header';
import { AlgorithmGallery } from '@/components/algorithmGallery/AlgorithmGallery';
import { SectionHeader } from '@/components/algorithmGallery/SectionHeader';
import LiquidChrome from '@/components/Background/LiquidChrome';

import {
  sampleAlgorithms,
  fallbackImages,
} from '@/components/algorithmGallery/sampleData';

// Default placeholder for all images in case neither main nor fallback images work
const DEFAULT_PLACEHOLDER = '/styleai/placeholder.png';

export default function AlgorithmGalleryPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  // Check for incoming transition
  useEffect(() => {
    // Reset transition state when component mounts
    setIsTransitioning(false);
  }, []);

  // Generate solid color placeholder if neither the algorithmic image nor fallback is available
  const generatePlaceholder = (index: number) => {
    // Array of pleasant colors for placeholders
    const colors = [
      '#2D4B37', // Main brand green
      '#FF9999', // Brand accent
      '#6A8D73', // Light green
      '#D1E6D6', // Pale green
      '#4A6B53', // Dark green
      '#B9D4C2', // Another pale green
      '#1E352F', // Very dark green
    ];

    return colors[index % colors.length];
  };

  // Process the algorithm data to use fallback images if needed
  const processedAlgorithms = sampleAlgorithms.map((algorithm, index) => ({
    ...algorithm,
    imageUrl: fallbackImages[index % fallbackImages.length],
    bgColor: generatePlaceholder(index), // Add a background color as ultimate fallback
  }));

  return (
    <motion.div
      className="relative min-h-screen bg-gray-50"
      initial="initial"
      animate={isTransitioning ? 'exit' : 'animate'}
      variants={pageVariants}
      transition={{ duration: 0.5 }}>
      {/* 背景层，z-index 为 0 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <LiquidChrome
          baseColor={[0.9, 0.9, 0.9]}
          speed={0.3}
          amplitude={0.7}
          frequencyX={4}
          frequencyY={3}
          interactive={true}
        />
      </div>

      {/* 内容层，可以通过设置更高的 z-index 确保其在上面 */}
      <div className="relative z-10">
        <RecommendationHeader />

        <main className="w-full pt-20 pb-16 overflow-hidden">
          <div className="text-center px-4 sm:px-6 md:px-8 mb-8">
            <SectionHeader
              title="Choose The Style Recommendations You Want"
              description="We offer a variety of services, click to choose your favorite! Each recommendation is based on advanced AI algorithms that provide in-depth analysis for you, which will definitely be helpful."
            />
          </div>

          <div className="mb-16 w-full">
            <AlgorithmGallery
              algorithms={processedAlgorithms}
              onTransitionStart={(id) => {
                setIsTransitioning(true);
                setTimeout(() => {
                  router.push(`/${id}`);
                }, 800);
              }}
            />
          </div>
        </main>
      </div>
    </motion.div>
  );
}
