'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RecommendationHeader } from '@/components/recommendation/Header';
import LiquidChrome from '@/components/Background/LiquidChrome';
import StyleRecommendations from '@/components/recommendation/StyleRecommendations';
import { AnalysisReport } from '@/components/analysis/AnalysisReport';
import { ScrollIndicator } from '@/components/analysis/ScrollIndicator';
import { useJobDescription } from '@/hooks/useJobDescription';
import { useBestFitImage } from '@/hooks/useBestFitImage';
import { CleanLoadingOverlay } from '@/components/loading/CleanLoadingOverlay';
import {
  defaultStyleRecommendations,
  defaultAnalysisResults,
} from '@/constants/defaultAnalysisData';
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from 'react-zoom-pan-pinch';

/**
 * Image zoom controls component
 * Provides zoom in, zoom out, and reset controls for the image
 */
const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute bottom-3 right-3 flex space-x-2 z-10">
      <button
        onClick={() => zoomIn()}
        className="bg-white/80 hover:bg-white text-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all"
        aria-label="Zoom in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <button
        onClick={() => zoomOut()}
        className="bg-white/80 hover:bg-white text-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all"
        aria-label="Zoom out">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <button
        onClick={() => resetTransform()}
        className="bg-white/80 hover:bg-white text-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all"
        aria-label="Reset zoom">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
      </button>
    </div>
  );
};

export default function GenerateReport() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [enableScrollEffects, setEnableScrollEffects] = useState(false);
  const [allowScroll, setAllowScroll] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);

  const {
    analysisData,
    rawAnalysisData,
    isLoading: isLoadingAnalysis,
    error: analysisError,
    overallDescription,
    jobId,
  } = useJobDescription();

  const {
    bestFitImage,
    isLoading: isLoadingBestFit,
    error: bestFitError,
  } = useBestFitImage();

  const isPageLoading = isLoadingAnalysis || isLoadingBestFit;

  const scrollRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userImageFromStorage = sessionStorage.getItem('userImage');
    if (userImageFromStorage) {
      setUserImage(userImageFromStorage);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end start'],
  });

  const opacityTransform = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scaleTransform = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    if (!isPageLoading) {
      const scrollEffectsTimer = setTimeout(() => {
        setEnableScrollEffects(true);
        console.log('启用滚动效果');
      }, 1500);

      return () => {
        clearTimeout(scrollEffectsTimer);
      };
    }
  }, [isPageLoading]);

  useEffect(() => {
    if (showScrollIndicator) {
      setAllowScroll(true);
      console.log('允许滚动：设置allowScroll为true');
    }
  }, [showScrollIndicator]);

  useEffect(() => {
    const preventScroll = (e: WheelEvent | TouchEvent) => {
      if (!allowScroll) {
        e.preventDefault();
      }
    };

    console.log('当前滚动状态:', allowScroll ? '允许' : '禁止');
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [allowScroll]);

  useEffect(() => {
    if (!isPageLoading && analysisData) {
      // 简单地在数据加载完成后显示滚动指示器
      const timer = setTimeout(() => {
        setShowScrollIndicator(true);
        console.log('显示滚动指示器');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPageLoading, analysisData]);

  const scrollToRecommendations = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth' });
      console.log('滚动到推荐部分');
    }
  };

  const getOpacityValue = () => {
    return enableScrollEffects ? opacityTransform : 1;
  };

  const getScaleValue = () => {
    return enableScrollEffects ? scaleTransform : 1;
  };

  const styleRecommendations = defaultStyleRecommendations.map((rec, index) => {
    if (analysisData?.styles && analysisData.styles.length > index) {
      return {
        ...rec,
        title: analysisData.styles[index],
      };
    }
    return rec;
  });

  const analysisResults = {
    ...defaultAnalysisResults,
    styleMatch:
      analysisData?.styles && analysisData.styles.length > 0
        ? analysisData.styles[0]
        : defaultAnalysisResults.styleMatch,
  };

  console.log('页面渲染状态:', {
    isPageLoading,
    isLoadingAnalysis,
    isLoadingBestFit,
    enableScrollEffects,
    allowScroll,
    showScrollIndicator,
  });

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

      <CleanLoadingOverlay
        isVisible={isLoadingAnalysis}
        currentStage="analysis"
        stages={[
          {
            id: 'analysis',
            title: 'Style Analysis',
            description: 'Analyzing your uploaded image',
            icon: 'analysis' as const,
            estimatedDuration: 3000,
          },
          {
            id: 'processing',
            title: 'AI Processing',
            description: 'Running advanced style algorithms',
            icon: 'processing' as const,
            estimatedDuration: 4000,
          },
          {
            id: 'recommendations',
            title: 'Generating Results',
            description: 'Creating your personalized report',
            icon: 'recommendations' as const,
            estimatedDuration: 2000,
          },
        ]}
        title="Analyzing Your Style"
        subtitle="AI is processing your image to create personalized recommendations"
        theme="light"
      />

      <div className="relative" ref={scrollRef}>
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
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
            <LiquidChrome
              baseColor={[0.9, 0.9, 0.9]}
              speed={0.3}
              amplitude={0.7}
              frequencyX={4}
              frequencyY={3}
              interactive={false}
            />
            <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <motion.h1
              className="text-3xl font-bold mb-8 text-center font-playfair text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}>
              Personalized Analysis for Your Style
            </motion.h1>

            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8" style={{ height: 'auto' }}>
                {/* 左侧 - 用户上传图片 */}
                <div className="w-full md:w-1/2">
                  <div className="bg-white/60 backdrop-blur-xs p-4 rounded-lg shadow-md h-[65vh] flex flex-col">
                    <h2 className="text-xl font-bold mb-4 font-playfair text-gray-800 border-b border-gray-200 pb-2">
                      Your Uploaded Image
                    </h2>

                    <div className="flex-1 min-h-0 rounded-lg overflow-hidden shadow-sm relative">
                      {userImage ? (
                        <div className="absolute inset-0">
                          <TransformWrapper
                            initialScale={1}
                            minScale={0.5}
                            maxScale={3}
                            centerOnInit={true}>
                            {() => (
                              <>
                                <ZoomControls />
                                <TransformComponent wrapperClass="w-full h-full">
                                  <img
                                    src={userImage}
                                    alt="Your uploaded image"
                                    className="w-full h-full object-cover"
                                  />
                                </TransformComponent>
                              </>
                            )}
                          </TransformWrapper>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <p className="text-gray-500 font-inter">
                            No image uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 右侧 - 风格分析结果 */}
                <motion.div className="w-full md:w-1/2">
                  <div className="bg-white/60 backdrop-blur-xs p-6 rounded-lg shadow-md h-[65vh] flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 font-playfair text-gray-800 border-b border-gray-200 pb-2">
                      Your Style Analysis
                    </h2>

                    <div className="flex-1 min-h-0">
                      <AnalysisReport
                        isLoadingAnalysis={isLoadingAnalysis}
                        analysisError={analysisError || bestFitError}
                        jobId={jobId}
                        overallDescription={overallDescription}
                        analysisPoints={analysisData?.features || []}
                        recommendedStyles={analysisData?.styles || []}
                        rawAnalysisData={rawAnalysisData}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            {/* 后续内容加载提示 - 当分析已加载但最佳风格推荐仍在加载时显示 */}
            {!isLoadingAnalysis && isLoadingBestFit && (
              <motion.div
                className="mt-8 flex flex-col items-center justify-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center">
                  {/* 高级加载动画 */}
                  <div className="relative w-32 h-32 mb-6">
                    {/* 外环 */}
                    <motion.div
                      className="absolute inset-0 border-4 border-[#84a59d]/20 rounded-full"
                      style={{ borderTopColor: '#84a59d' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* 中环 */}
                    <motion.div
                      className="absolute inset-4 border-3 border-[#84a59d]/10 rounded-full"
                      style={{ borderRightColor: '#84a59d' }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* 内环光效 */}
                    <motion.div
                      className="absolute inset-8 rounded-full"
                      style={{
                        background: `conic-gradient(from 0deg, transparent, #84a59d80, transparent)`,
                        filter: 'blur(4px)',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* 中心图标 */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-4xl"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      ✨
                    </motion.div>

                    {/* 环绕粒子 */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-[#84a59d]/60 rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                          transformOrigin: `${40 + i * 5}px 0px`,
                        }}
                        animate={{
                          rotate: 360,
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>

                  {/* 文本信息 */}
                  <motion.div
                    className="text-center"
                    animate={{
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 font-playfair">
                      Generating Your Best Fit
                    </h3>
                    <p className="text-gray-600 font-inter">
                      Creating personalized style recommendations
                    </p>
                  </motion.div>

                  {/* 进度点 */}
                  <motion.div
                    className="flex justify-center space-x-2 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-[#84a59d]/40 rounded-full"
                        animate={{
                          y: [-4, 4, -4],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
            <ScrollIndicator
              showScrollIndicator={showScrollIndicator && !!userImage}
              onScroll={scrollToRecommendations}
            />
          </div>
        </motion.div>

        <div ref={recommendationsRef}>
          <StyleRecommendations
            userImage={userImage}
            bestFitImage={bestFitImage}
            styleRecommendations={styleRecommendations}
            analysisResults={analysisResults}
            isLoadingBestFit={isLoadingBestFit}
            bestFitError={bestFitError}
            analysisData={rawAnalysisData}
          />
        </div>
      </div>
    </>
  );
}
