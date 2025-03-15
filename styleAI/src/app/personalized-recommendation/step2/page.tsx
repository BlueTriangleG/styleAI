'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RecommendationHeader } from '@/components/recommendation/Header';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import LiquidChrome from '@/components/background/LiquidChrome';
import StyleRecommendations from '@/components/recommendation/StyleRecommendations';

export default function Step2() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [typingComplete, setTypingComplete] = useState<number>(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); // 页面加载状态
  const [enableScrollEffects, setEnableScrollEffects] = useState(false); // 控制滚动效果
  const [allowScroll, setAllowScroll] = useState(false); // 控制是否允许滚动
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  // 滚动动画控制 - 始终创建这些hooks，不管enableScrollEffects的值
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end start'],
  });

  // 创建transform
  const opacityTransform = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scaleTransform = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

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

  // 风格推荐内容
  const styleRecommendations = [
    {
      title: 'Business Casual',
      description:
        'Based on your facial features and body type, business casual attire will complement your appearance perfectly. Focus on well-fitted blazers, button-down shirts, and tailored pants.',
      examples: ['Style Example 1', 'Style Example 2', 'Style Example 3'],
    },
    {
      title: 'Smart Casual',
      description:
        'For a more relaxed yet polished look, smart casual options would work well with your features. Consider premium t-shirts, chinos, and casual jackets.',
      examples: ['Style Example 1', 'Style Example 2', 'Style Example 3'],
    },
    {
      title: 'Formal Wear',
      description:
        'For special occasions, your features would be enhanced by well-tailored suits in navy or charcoal. Consider slim-fit designs with subtle patterns.',
      examples: ['Style Example 1', 'Style Example 2', 'Style Example 3'],
    },
    {
      title: 'Formal Wear',
      description:
        'For special occasions, your features would be enhanced by well-tailored suits in navy or charcoal. Consider slim-fit designs with subtle patterns.',
      examples: ['Style Example 1', 'Style Example 2', 'Style Example 3'],
    },
  ];

  // 分析结果
  const analysisResults = {
    faceShape: 'Oval',
    skinTone: 'Warm',
    bodyType: 'Athletic',
    styleMatch: 'Business Casual',
  };

  // 当滚动指示器显示时，启用滚动
  useEffect(() => {
    if (showScrollIndicator) {
      setAllowScroll(true);
    }
  }, [showScrollIndicator]);

  // 禁用滚动功能
  useEffect(() => {
    // 禁用滚动的函数
    const preventScroll = (e: WheelEvent | TouchEvent) => {
      if (!allowScroll) {
        e.preventDefault();
      }
    };

    // 添加事件监听器
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    // 清理函数
    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [allowScroll]);

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

      // 页面内容加载完成
      setIsPageLoading(false);

      // 延迟启用滚动效果，确保页面内容先显示
      const scrollEffectsTimer = setTimeout(() => {
        setEnableScrollEffects(true);
      }, 1500);

      return () => clearTimeout(scrollEffectsTimer);
    }
  }, [router]);

  // 设置打字动画
  useEffect(() => {
    if (isPageLoading) return;

    const typingTimer = setInterval(() => {
      setTypingComplete((prev) => {
        if (prev < analysisPoints.length) {
          return prev + 1;
        } else {
          clearInterval(typingTimer);
          // 所有分析点显示完成后，显示滚动指示器
          setShowScrollIndicator(true);
          return prev;
        }
      });
    }, 1000); // 每秒显示一个分析点

    return () => clearInterval(typingTimer);
  }, [isPageLoading, analysisPoints.length]);

  // 滚动到推荐部分
  const scrollToRecommendations = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 计算最终的样式值
  const getOpacityValue = () => {
    return enableScrollEffects ? opacityTransform : 1;
  };

  const getScaleValue = () => {
    return enableScrollEffects ? scaleTransform : 1;
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

  const scrollIndicatorVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: [0, 1, 0],
      y: [0, 10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          overflow: ${allowScroll ? 'auto' : 'hidden'};
          height: 100%;
        }
      `}</style>

      <RecommendationHeader />

      {/* 添加页面加载指示器 */}
      {isPageLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-[#84a59d] animate-spin-slow mb-4"
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
            <p className="text-gray-600 font-inter text-lg">
              Loading your analysis...
            </p>
          </div>
        </div>
      )}

      <div className="relative" ref={scrollRef}>
        {/* 第一部分：分析页面 */}
        <motion.div
          ref={analysisRef}
          className="min-h-screen pt-20 relative"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            opacity: getOpacityValue(),
            scale: getScaleValue(),
          }}
          transition={{ duration: 0.5 }}>
          {/* 流动背景 */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
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
                          animate={
                            typingComplete > index ? 'animate' : 'initial'
                          }
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

            {/* 滚动指示器 - 移至内容块下方居中 */}
            {showScrollIndicator && userImage && (
              <motion.div
                className="flex flex-col items-center mt-12 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}>
                <p className="text-gray-600 font-inter mb-2 text-center">
                  Scroll down to see your style recommendations
                </p>
                <motion.div
                  variants={scrollIndicatorVariants}
                  initial="initial"
                  animate="animate"
                  onClick={scrollToRecommendations}
                  className="cursor-pointer bg-[#84a59d]/10 hover:bg-[#84a59d]/20 p-3 rounded-full transition-all duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#84a59d]">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 第二部分：风格推荐 */}
        <div ref={recommendationsRef}>
          <StyleRecommendations
            userImage={userImage}
            styleRecommendations={styleRecommendations}
            analysisResults={analysisResults}
          />
        </div>
      </div>
    </>
  );
}
