'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RecommendationHeader } from '@/components/recommendation/Header';
import { motion, useScroll, useTransform } from 'framer-motion';
import LiquidChrome from '@/components/background/LiquidChrome';
import StyleRecommendations from '@/components/recommendation/StyleRecommendations';
import { apiService } from '@/lib/api/ApiService';

// 定义分析数据的类型
interface AnalysisPoint {
  title: string;
  content: string;
}

interface StyleRecommendation {
  title: string;
  description: string;
  examples: string[];
}

interface AnalysisResults {
  faceShape: string;
  skinTone: string;
  bodyType: string;
  styleMatch: string;
}

interface AnalysisData {
  features: AnalysisPoint[];
  colors: { name: string; hex: string }[];
  styles: string[];
}

export default function Step2() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [typingComplete, setTypingComplete] = useState<number>(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); // Page loading state
  const [enableScrollEffects, setEnableScrollEffects] = useState(false); // Control scroll effects
  const [allowScroll, setAllowScroll] = useState(false); // Control whether scrolling is allowed
  const [jobId, setJobId] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  // Scroll animation control - always create these hooks regardless of enableScrollEffects value
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end start'],
  });

  // Create transforms
  const opacityTransform = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scaleTransform = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // 默认分析结果，当API调用失败时使用
  const defaultAnalysisPoints: AnalysisPoint[] = [
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

  // 默认风格推荐，当API调用失败时使用
  const defaultStyleRecommendations: StyleRecommendation[] = [
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
      title: 'Sport',
      description:
        'For special occasions, your features would be enhanced by well-tailored suits in navy or charcoal. Consider slim-fit designs with subtle patterns.',
      examples: ['Style Example 1', 'Style Example 2', 'Style Example 3'],
    },
  ];

  // 默认分析结果
  const defaultAnalysisResults: AnalysisResults = {
    faceShape: 'Oval',
    skinTone: 'Warm',
    bodyType: 'Athletic',
    styleMatch: 'Business Casual',
  };

  // 获取个性化分析数据
  const fetchAnalysisData = async (jobId: string) => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);

    try {
      console.log('正在从sessionStorage获取分析数据...');
      // 从sessionStorage获取分析数据
      const storedData = sessionStorage.getItem('analysisData');

      if (!storedData) {
        console.error('未找到分析数据，使用默认数据');
        setAnalysisError('未找到分析数据，使用默认数据');
        // 使用默认数据
        const defaultData = {
          features: defaultAnalysisPoints,
          colors: [
            { name: 'Navy Blue', hex: '#000080' },
            { name: 'Burgundy', hex: '#800020' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Charcoal Gray', hex: '#36454F' },
          ],
          styles: ['Classic', 'Professional', 'Elegant', 'Sophisticated'],
        };
        setAnalysisData(defaultData);
        return defaultData;
      }

      // 解析存储的数据
      const data = JSON.parse(storedData);
      console.log('成功获取分析数据:', data);
      setAnalysisData(data);
      return data;
    } catch (error) {
      console.error('获取分析数据失败:', error);
      setAnalysisError('无法获取分析数据，使用默认数据');
      // 使用默认数据
      const defaultData = {
        features: defaultAnalysisPoints,
        colors: [
          { name: 'Navy Blue', hex: '#000080' },
          { name: 'Burgundy', hex: '#800020' },
          { name: 'Forest Green', hex: '#228B22' },
          { name: 'Charcoal Gray', hex: '#36454F' },
        ],
        styles: ['Classic', 'Professional', 'Elegant', 'Sophisticated'],
      };
      setAnalysisData(defaultData);
      return defaultData;
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // 从sessionStorage获取jobId并获取分析数据
  const getJobIdAndFetchData = async () => {
    try {
      // 从sessionStorage获取jobId
      const storedJobId = sessionStorage.getItem('currentJobId');

      if (!storedJobId) {
        console.error('未找到jobId，使用临时ID');
        const tempJobId = `temp-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;
        setJobId(tempJobId);
        return await fetchAnalysisData(tempJobId);
      }

      console.log(`从sessionStorage获取的jobId: ${storedJobId}`);
      setJobId(storedJobId);

      // 获取个性化分析数据
      return await fetchAnalysisData(storedJobId);
    } catch (error) {
      console.error('获取jobId或分析数据失败:', error);
      // 如果出错，使用临时jobId
      const tempJobId = `temp-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      console.log(`使用临时jobId: ${tempJobId}`);
      setJobId(tempJobId);

      // 获取个性化分析数据
      return await fetchAnalysisData(tempJobId);
    }
  };

  // Enable scrolling when scroll indicator is shown
  useEffect(() => {
    if (showScrollIndicator) {
      setAllowScroll(true);
    }
  }, [showScrollIndicator]);

  // Disable scrolling functionality
  useEffect(() => {
    // Function to prevent scrolling
    const preventScroll = (e: WheelEvent | TouchEvent) => {
      if (!allowScroll) {
        e.preventDefault();
      }
    };

    // Add event listeners
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    // Cleanup function
    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [allowScroll]);

  useEffect(() => {
    // Only access sessionStorage in browser environment
    if (typeof window !== 'undefined') {
      console.log('Step2页面加载，检查sessionStorage');
      try {
        // Retrieve the image from session storage
        const storedImage = sessionStorage.getItem('userImage');
        console.log(
          '从sessionStorage获取的图像:',
          storedImage ? '存在' : '不存在'
        );

        if (!storedImage) {
          // If no image is found, redirect back to step1
          console.log('未找到用户图像，重定向到step1');
          router.replace('/personalized-recommendation/step1');
          return;
        }

        setUserImage(storedImage);
        console.log('成功设置用户图像');

        // 获取jobId并获取分析数据
        getJobIdAndFetchData().then(() => {
          // 数据加载完成后，设置页面加载状态为false
          setIsPageLoading(false);
          console.log('页面加载完成，isPageLoading设置为false');

          // Delay enabling scroll effects to ensure page content is displayed first
          const scrollEffectsTimer = setTimeout(() => {
            setEnableScrollEffects(true);
            console.log('启用滚动效果');
          }, 1500);

          return () => {
            console.log('Step2组件卸载，清除timer');
            clearTimeout(scrollEffectsTimer);
          };
        });
      } catch (error) {
        console.error('访问sessionStorage时出错:', error);
        router.replace('/personalized-recommendation/step1');
      }
    }
  }, [router]);

  // Set up typing animation
  useEffect(() => {
    if (isPageLoading || !analysisData) return;

    const typingTimer = setInterval(() => {
      setTypingComplete((prev) => {
        if (prev < analysisData.features.length) {
          return prev + 1;
        } else {
          clearInterval(typingTimer);
          // Show scroll indicator after all analysis points are displayed
          setShowScrollIndicator(true);
          return prev;
        }
      });
    }, 1000); // Show one analysis point per second

    return () => clearInterval(typingTimer);
  }, [isPageLoading, analysisData]);

  // Scroll to recommendations section
  const scrollToRecommendations = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate final style values
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

  // 从API获取的数据或默认数据
  const analysisPoints = analysisData?.features || defaultAnalysisPoints;
  const styleRecommendations = defaultStyleRecommendations; // 这里可以根据API返回的数据构建风格推荐
  const analysisResults = defaultAnalysisResults; // 这里可以根据API返回的数据构建分析结果

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

      {/* Add page loading indicator */}
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
        {/* Part 1: Analysis page */}
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
          {/* Flowing background */}
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
              您的个性化分析
            </motion.h1>

            {userImage ? (
              <motion.div
                className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto"
                variants={containerVariants}>
                {/* Left side - User photo */}
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

                {/* Right side - Analysis report */}
                <motion.div className="w-full md:w-1/2" variants={itemVariants}>
                  <div className="bg-white/60 backdrop-blur-xs p-6 rounded-lg shadow-md h-full">
                    <h2 className="text-2xl font-bold mb-6 font-playfair text-gray-800 border-b border-gray-200 pb-2">
                      您的风格分析
                    </h2>

                    {isLoadingAnalysis ? (
                      <div className="flex justify-center items-center h-64">
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
                            正在加载分析结果...
                          </p>
                        </div>
                      </div>
                    ) : analysisError ? (
                      <div className="text-red-500 mb-4">{analysisError}</div>
                    ) : (
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
                              typingComplete > index
                                ? 'opacity-100'
                                : 'opacity-0'
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
                    )}
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
                    正在加载您的图像...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Scroll indicator - Centered below content block */}
            {showScrollIndicator && userImage && (
              <motion.div
                className="flex flex-col items-center mt-12 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}>
                <p className="text-gray-600 font-inter mb-2 text-center">
                  向下滚动查看您的风格推荐
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

        {/* Part 2: Style recommendations */}
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
