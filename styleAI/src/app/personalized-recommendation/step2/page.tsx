'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RecommendationHeader } from '@/components/recommendation/Header';
import { motion } from 'framer-motion';
import LiquidChrome from '@/components/background/LiquidChrome';

export default function Step2() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [typingComplete, setTypingComplete] = useState<number>(0);
  const router = useRouter();

  // 分析报告内容
  const analysisPoints = [
    {
      title: 'Striking Features',
      content:
        'They have a captivating look with expressive eyes and a warm smile that immediately draws attention.',
    },
    {
      title: 'Well-Defined Facial Structure',
      content:
        'Their face features high cheekbones, a sharp jawline, and a balanced symmetry, giving them a classic yet modern appearance.',
    },
    {
      title: 'Distinctive Style',
      content:
        'Their hairstyle and grooming are impeccably maintained, complementing their overall polished and stylish look.',
    },
    {
      title: 'Elegant and Timeless',
      content:
        'With a natural elegance and subtle makeup, they exude a timeless charm that stands out in any setting.',
    },
  ];

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

    // 设置打字动画的定时器
    const typingTimer = setInterval(() => {
      setTypingComplete((prev) => {
        if (prev < analysisPoints.length) {
          return prev + 1;
        } else {
          clearInterval(typingTimer);
          return prev;
        }
      });
    }, 1000); // 每秒显示一个分析点

    return () => clearInterval(typingTimer);
  }, [router, analysisPoints.length]);

  // Handle next button click
  const handleNextClick = () => {
    // Start transition animation
    setIsTransitioning(true);

    // Navigate to the next step after animation completes
    setTimeout(() => {
      router.push('/personalized-recommendation/step3');
    }, 500); // Match this with animation duration
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        when: 'afterChildren',
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const textRevealVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <>
      <RecommendationHeader />
      <motion.div
        className="min-h-screen pt-20 relative"
        initial="initial"
        animate={isTransitioning ? 'exit' : 'animate'}
        variants={pageVariants}
        transition={{ duration: 0.5 }}>
        {/* 流动背景 */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <LiquidChrome
            baseColor={[0.9, 0.9, 0.9]}
            speed={0.2}
            amplitude={0.5}
            frequencyX={3}
            frequencyY={2}
            interactive={false}
          />
          <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.h1
            className="text-3xl font-bold mb-8 text-center font-playfair text-gray-800"
            variants={itemVariants}>
            Your Personalized Analysis
          </motion.h1>

          {userImage ? (
            <motion.div
              className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto"
              variants={containerVariants}>
              {/* 左侧 - 用户照片 */}
              <motion.div
                className="w-full md:w-1/2 flex justify-center"
                variants={itemVariants}>
                <div className="relative w-full max-w-md aspect-[3/4] shadow-lg rounded-lg overflow-hidden">
                  <Image
                    src={userImage}
                    alt="Your uploaded image"
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              </motion.div>

              {/* 右侧 - 分析报告 */}
              <motion.div className="w-full md:w-1/2" variants={itemVariants}>
                <div className="bg-white/60 backdrop-blur-xs p-6 rounded-lg shadow-md h-full">
                  <h2 className="text-2xl font-bold mb-6 font-playfair text-gray-800 border-b border-gray-200 pb-2">
                    Your Style Analysis
                  </h2>

                  <div className="space-y-6 mb-8">
                    {analysisPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial="initial"
                        animate={typingComplete > index ? 'animate' : 'initial'}
                        variants={textRevealVariants}
                        className={`transition-opacity duration-500 ${
                          typingComplete > index ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <h3 className="text-lg font-bold font-playfair text-gray-800 mb-2">
                          {index + 1}. {point.title}
                        </h3>
                        <p className="text-gray-700 font-inter">
                          {point.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    onClick={handleNextClick}
                    className="w-full py-3 px-6 rounded-md text-white font-medium bg-[#84a59d] hover:bg-[#6b8c85] transition-colors shadow-md font-inter mt-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      opacity:
                        typingComplete >= analysisPoints.length ? 1 : 0.5,
                      pointerEvents:
                        typingComplete >= analysisPoints.length
                          ? 'auto'
                          : 'none',
                    }}
                    transition={{ duration: 0.3 }}>
                    View Style Recommendations
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="flex justify-center items-center h-64"
              variants={itemVariants}>
              <div className="flex flex-col items-center">
                <svg
                  className="w-12 h-12 text-[#84a59d] animate-spin-slow mb-4"
                  viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                  />
                </svg>
                <p className="text-gray-500 font-inter">
                  Loading your image...
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}
