'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { loadingIcons, LoadingIconType } from '@/components/icons/LoadingIcons';

interface LoadingStage {
  id: string;
  title: string;
  description: string;
  icon: LoadingIconType;
  estimatedDuration: number;
}

interface CleanLoadingOverlayProps {
  isVisible: boolean;
  currentStage?: string;
  progress?: number;
  onComplete?: () => void;
  stages?: LoadingStage[];
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark' | 'gradient';
}

const defaultStages: LoadingStage[] = [
  {
    id: 'upload',
    title: 'Processing Upload',
    description: 'Analyzing your uploaded image',
    icon: 'upload',
    estimatedDuration: 2000,
  },
  {
    id: 'analyze',
    title: 'AI Analysis',
    description: 'Running advanced style analysis',
    icon: 'analysis',
    estimatedDuration: 5000,
  },
  {
    id: 'generate',
    title: 'Generating Results',
    description: 'Creating personalized recommendations',
    icon: 'generate',
    estimatedDuration: 3000,
  },
  {
    id: 'finalize',
    title: 'Finalizing',
    description: 'Preparing your style report',
    icon: 'finalize',
    estimatedDuration: 1000,
  },
];

export function CleanLoadingOverlay({
  isVisible,
  currentStage,
  progress = 0,
  onComplete,
  stages = defaultStages,
  title = 'StyleAI Processing',
  subtitle = 'Creating your personalized style analysis',
  theme = 'gradient',
}: CleanLoadingOverlayProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // 只处理外部传入的当前阶段，不自己生成进度
  useEffect(() => {
    if (currentStage) {
      const stageIndex = stages.findIndex(stage => stage.id === currentStage);
      if (stageIndex !== -1) {
        setCurrentStageIndex(stageIndex);
      }
    }
  }, [currentStage, stages]);

  // 完成检测 - 只有在外部明确传入100%时才触发
  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  // 主题配置 - 使用系统主题色系
  const themeConfig = {
    light: {
      background: 'bg-white/95 backdrop-blur-xl',
      overlay: 'bg-white/90',
      text: 'text-[#2D4B37]',
      subtext: 'text-[#2D4B37]/70',
      accent: '#2D4B37',
      accentSecondary: '#84a59d',
      progressBg: 'bg-[#84a59d]/20',
      border: 'border-[#84a59d]/30',
    },
    dark: {
      background: 'bg-[#1F3526]/95 backdrop-blur-xl',
      overlay: 'bg-[#2D4B37]/90',
      text: 'text-white',
      subtext: 'text-white/80',
      accent: '#84a59d',
      accentSecondary: '#2D4B37',
      progressBg: 'bg-[#84a59d]/30',
      border: 'border-[#84a59d]/40',
    },
    gradient: {
      background: 'bg-gradient-to-br from-[#2D4B37]/40 via-[#84a59d]/30 to-[#1F3526]/40 backdrop-blur-xl',
      overlay: 'bg-gradient-to-br from-[#2D4B37]/20 to-[#84a59d]/20',
      text: 'text-white',
      subtext: 'text-white/90',
      accent: '#84a59d',
      accentSecondary: '#2D4B37',
      progressBg: 'bg-white/20',
      border: 'border-white/30',
    },
  };

  const colors = themeConfig[theme];
  const currentStageData = stages[currentStageIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 背景 */}
          <div className={`absolute inset-0 ${colors.background}`} />

          {/* 主内容 */}
          <motion.div
            className="relative z-10 max-w-md w-full mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className={`relative p-8 rounded-2xl shadow-2xl ${colors.overlay} border ${colors.border}`}>
              
              {/* 标题区域 */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className={`text-2xl font-bold ${colors.text} font-playfair mb-2`}>
                  {title}
                </h1>
                <p className={`${colors.subtext} font-inter`}>
                  {subtitle}
                </p>
              </motion.div>

              {/* 主要加载动画 */}
              <div className="flex flex-col items-center mb-8">
                {/* 简洁的旋转器 */}
                <div className="relative w-20 h-20 mb-6">
                  {/* 外环 */}
                  <motion.div
                    className="absolute inset-0 border-4 rounded-full"
                    style={{ 
                      borderColor: `${colors.accentSecondary}40`,
                      borderTopColor: colors.accent 
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* 中心图标 */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {currentStageData?.icon ? (
                      React.createElement(loadingIcons[currentStageData.icon], {
                        size: 32,
                        className: `${colors.text} drop-shadow-sm`
                      })
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={colors.text}>
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </motion.div>
                </div>

                {/* 当前阶段信息 */}
                <motion.div
                  className="text-center"
                  key={currentStageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className={`text-lg font-semibold ${colors.text} mb-2 font-inter`}>
                    {currentStageData?.title || 'Processing...'}
                  </h3>
                  <p className={`${colors.subtext} font-inter text-sm`}>
                    {currentStageData?.description || 'Please wait...'}
                  </p>
                </motion.div>
              </div>

              {/* 进度条 */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm ${colors.subtext} font-inter`}>
                    Progress
                  </span>
                  <span className={`text-sm font-bold ${colors.text} font-mono`}>
                    {Math.round(progress)}%
                  </span>
                </div>
                
                <div className={`relative h-3 ${colors.progressBg} rounded-full overflow-hidden`}>
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentSecondary})`,
                      boxShadow: `0 0 15px ${colors.accent}40, 0 2px 8px ${colors.accent}20`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeOut" 
                    }}
                  />
                  
                  {/* 进度条内部高光 */}
                  <motion.div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background: `linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeOut" 
                    }}
                  />
                </div>
              </motion.div>

              {/* 阶段指示器 */}
              <motion.div
                className="flex justify-center space-x-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    className={`w-2 h-2 rounded-full transition-colors duration-300`}
                    style={{
                      backgroundColor: index <= currentStageIndex 
                        ? colors.accent 
                        : `${colors.accentSecondary}40`
                    }}
                    animate={{
                      scale: index === currentStageIndex ? [1, 1.3, 1] : 1,
                      boxShadow: index === currentStageIndex 
                        ? [`0 0 0 ${colors.accent}00`, `0 0 8px ${colors.accent}80`, `0 0 0 ${colors.accent}00`]
                        : `0 0 0 ${colors.accent}00`,
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: index === currentStageIndex ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>

              {/* 完成动画 */}
              {progress >= 100 && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}f0, ${colors.accentSecondary}f0)`
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 bg-white/30 rounded-full flex items-center justify-center"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2 font-playfair">Analysis Complete!</h3>
                    <p className="text-white/90 font-inter">Redirecting to your style report...</p>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}