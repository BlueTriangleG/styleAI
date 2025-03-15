'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RecommendationHeader } from '@/components/recommendation/Header';
import LiquidChrome from '@/components/background/LiquidChrome';
import ImageTrail from '@/components/ui/imageTail';

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // 检查是否有用户图片，如果没有则重定向到step1
    if (typeof window !== 'undefined') {
      const storedImage = sessionStorage.getItem('userImage');
      if (!storedImage) {
        router.push('/personalized-recommendation/step1');
        return;
      }
    }

    // 模拟加载进度
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          // 加载完成后开始过渡动画
          setIsTransitioning(true);

          // 动画完成后导航到step2
          setTimeout(() => {
            router.push('/personalized-recommendation/step2');
          }, 500);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [router]);

  // 动画变体
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

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <RecommendationHeader />
      <ImageTrail
        items={[
          'https://picsum.photos/id/287/300/300',
          'https://picsum.photos/id/1001/300/300',
          'https://picsum.photos/id/1025/300/300',
          'https://picsum.photos/id/1026/300/300',
          'https://picsum.photos/id/1027/300/300',
          'https://picsum.photos/id/1028/300/300',
          'https://picsum.photos/id/1029/300/300',
          'https://picsum.photos/id/1030/300/300',
        ]}
        variant={1}
      />
      {/* 流动背景 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <LiquidChrome
          baseColor={[0.9, 0.9, 0.9]}
          speed={0.3}
          amplitude={0.7}
          frequencyX={4}
          frequencyY={3}
          interactive={true}
        />
        <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
      </div>
      <motion.div
        className="min-h-screen pt-20 relative"
        initial="initial"
        animate={isTransitioning ? 'exit' : 'animate'}
        variants={pageVariants}
        transition={{ duration: 0.5 }}>
        {/* 内容区域 */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto flex flex-col items-center justify-center"
            variants={containerVariants}>
            <motion.div className="mb-8 text-center" variants={itemVariants}>
              <h1 className="text-3xl font-bold mb-2 font-playfair text-gray-800">
                分析您的照片
              </h1>
              <p className="text-lg text-gray-600 font-inter">
                我们正在处理您的照片以创建个性化推荐
              </p>
            </motion.div>

            <motion.div className="w-full mb-8" variants={itemVariants}>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-[#84a59d] h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-right text-sm text-gray-600 font-inter">
                {progress}%
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              variants={itemVariants}>
              <motion.div
                className="relative w-24 h-24 mb-6"
                variants={pulseVariants}>
                <svg
                  className="w-full h-full text-[#84a59d] animate-spin-slow"
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
              </motion.div>

              <motion.div
                className="text-center space-y-2"
                variants={itemVariants}>
                <p className="text-gray-700 font-inter">
                  请稍等片刻，我们正在：
                </p>
                <ul className="text-gray-600 space-y-1 font-inter">
                  <li>✓ 分析您的面部特征</li>
                  <li>✓ 确定您的体型</li>
                  <li>{progress >= 50 ? '✓' : '⋯'} 识别您的风格偏好</li>
                  <li>{progress >= 75 ? '✓' : '⋯'} 生成个性化推荐</li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
