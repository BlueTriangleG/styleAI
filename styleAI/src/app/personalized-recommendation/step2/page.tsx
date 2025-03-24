'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RecommendationHeader } from '@/components/recommendation/Header';
import LiquidChrome from '@/components/background/LiquidChrome';
import StyleRecommendations from '@/components/recommendation/StyleRecommendations';
import { AnalysisReport } from '@/components/analysis/AnalysisReport';
import { ImageComparison } from '@/components/analysis/ImageComparison';
import { ScrollIndicator } from '@/components/analysis/ScrollIndicator';
import { useJobDescription } from '@/hooks/useJobDescription';
import { useBestFitImage } from '@/hooks/useBestFitImage';
import {
  defaultStyleRecommendations,
  defaultAnalysisResults,
} from '@/constants/defaultAnalysisData';

export default function Step2() {
  const [typingComplete, setTypingComplete] = useState<number>(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [enableScrollEffects, setEnableScrollEffects] = useState(false);
  const [allowScroll, setAllowScroll] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);

  const {
    analysisData,
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
    if (isPageLoading || !analysisData) return;

    if (!analysisData.features || !Array.isArray(analysisData.features)) {
      console.error('分析数据中的features不存在或不是数组:', analysisData);
      return;
    }

    if (overallDescription) {
      setTypingComplete(analysisData.features.length);
      setTimeout(() => {
        setShowScrollIndicator(true);
        console.log('显示滚动指示器');
      }, 1000);
      return;
    }

    const typingTimer = setInterval(() => {
      setTypingComplete((prev) => {
        if (prev < analysisData.features.length) {
          return prev + 1;
        } else {
          clearInterval(typingTimer);
          setShowScrollIndicator(true);
          console.log('显示滚动指示器');
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(typingTimer);
  }, [isPageLoading, analysisData, overallDescription]);

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
              {isLoadingAnalysis && isLoadingBestFit
                ? 'Loading your analysis and style recommendation...'
                : isLoadingAnalysis
                ? 'Loading your analysis...'
                : 'Finding your best style match...'}
            </p>
          </div>
        </div>
      )}

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
            <motion.h1 className="text-3xl font-bold mb-8 text-center font-playfair text-gray-800">
              您的个性化分析
            </motion.h1>

            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 font-playfair text-gray-800">
                Your best fit recommendation
              </h2>

              <ImageComparison
                userImage={userImage}
                bestFitImage={bestFitImage}
                isPageLoading={isPageLoading}
              />

              <motion.div className="w-full md:w-1/3">
                <div className="bg-white/60 backdrop-blur-xs p-6 rounded-lg shadow-md h-full">
                  <h2 className="text-2xl font-bold mb-6 font-playfair text-gray-800 border-b border-gray-200 pb-2">
                    您的风格分析
                  </h2>

                  <AnalysisReport
                    isLoadingAnalysis={isLoadingAnalysis}
                    analysisError={analysisError || bestFitError}
                    jobId={jobId}
                    overallDescription={overallDescription}
                    analysisPoints={analysisData?.features || []}
                    recommendedStyles={analysisData?.styles || []}
                    typingComplete={typingComplete}
                  />
                </div>
              </motion.div>
            </div>

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
          />
        </div>
      </div>
    </>
  );
}
