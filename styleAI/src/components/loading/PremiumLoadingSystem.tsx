'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export interface LoadingStep {
  id: string;
  title: string;
  description: string;
  duration: number; // 预期持续时间（毫秒）
  icon?: string;
}

interface PremiumLoadingSystemProps {
  steps: LoadingStep[];
  currentStep?: string;
  progress?: number; // 0-100
  onComplete?: () => void;
  showProgress?: boolean;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PremiumLoadingSystem({
  steps,
  currentStep,
  progress: externalProgress,
  onComplete,
  showProgress = true,
  theme = 'light',
  size = 'lg',
}: PremiumLoadingSystemProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'completing' | 'completed'>('loading');

  // 配置大小
  const sizeConfig = {
    sm: {
      container: 'w-80 max-w-sm',
      spinner: 'w-16 h-16',
      text: 'text-sm',
      title: 'text-lg',
      progress: 'h-2',
    },
    md: {
      container: 'w-96 max-w-md',
      spinner: 'w-20 h-20',
      text: 'text-base',
      title: 'text-xl',
      progress: 'h-3',
    },
    lg: {
      container: 'w-[500px] max-w-lg',
      spinner: 'w-24 h-24',
      text: 'text-lg',
      title: 'text-2xl',
      progress: 'h-4',
    },
    xl: {
      container: 'w-[600px] max-w-xl',
      spinner: 'w-32 h-32',
      text: 'text-xl',
      title: 'text-3xl',
      progress: 'h-5',
    },
  };

  const config = sizeConfig[size];
  const progress = externalProgress ?? internalProgress;

  // 自动进度模拟
  useEffect(() => {
    if (externalProgress === undefined) {
      const interval = setInterval(() => {
        setInternalProgress(prev => {
          if (prev >= 95) {
            setAnimationPhase('completing');
            return prev;
          }
          return Math.min(prev + Math.random() * 3, 95);
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [externalProgress]);

  // 步骤切换逻辑
  useEffect(() => {
    if (currentStep) {
      const stepIndex = steps.findIndex(step => step.id === currentStep);
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [currentStep, steps]);

  // 完成检测
  useEffect(() => {
    if (progress >= 100 && animationPhase !== 'completed') {
      setAnimationPhase('completed');
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    }
  }, [progress, animationPhase, onComplete]);

  const currentStepData = steps[currentStepIndex] || steps[0];

  // 主题配置
  const themeConfig = {
    light: {
      bg: 'bg-white/95 backdrop-blur-xl',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      subText: 'text-gray-600',
      accent: '#84a59d',
      accentRgb: '132, 165, 157',
    },
    dark: {
      bg: 'bg-gray-900/95 backdrop-blur-xl',
      border: 'border-gray-700/50',
      text: 'text-gray-100',
      subText: 'text-gray-300',
      accent: '#84a59d',
      accentRgb: '132, 165, 157',
    },
  };

  const colors = themeConfig[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景 */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      {/* 主要容器 */}
      <motion.div
        className={`
          relative ${config.container} p-8 rounded-2xl shadow-2xl 
          ${colors.bg} ${colors.border} border
        `}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" }
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.95, 
          y: -20,
          transition: { duration: 0.3 }
        }}
      >
        {/* 装饰性背景动画 */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -right-1/2 w-full h-full opacity-5"
            style={{ background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)` }}
            animate={{
              rotate: 360,
              transition: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -left-1/2 w-full h-full opacity-3"
            style={{ background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)` }}
            animate={{
              rotate: -360,
              transition: { duration: 25, repeat: Infinity, ease: "linear" }
            }}
          />
        </div>

        {/* 内容 */}
        <div className="relative z-10">
          {/* 标题区域 */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className={`${config.title} font-bold ${colors.text} font-playfair mb-2`}>
              StyleAI Processing
            </h1>
            <p className={`${colors.subText} font-inter`}>
              Creating your personalized style analysis
            </p>
          </motion.div>

          {/* 主要加载动画 */}
          <div className="flex flex-col items-center mb-8">
            {/* 高级旋转器 */}
            <div className={`relative ${config.spinner} mb-6`}>
              {/* 外环 */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-gray-200/30"
                style={{ borderTopColor: colors.accent }}
                animate={{
                  rotate: 360,
                  transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
                }}
              />
              
              {/* 中环 */}
              <motion.div
                className="absolute inset-2 rounded-full border-3 border-gray-100/20"
                style={{ borderRightColor: colors.accent }}
                animate={{
                  rotate: -360,
                  transition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              />
              
              {/* 内环发光效果 */}
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0%, ${colors.accent}40 50%, transparent 100%)`,
                  filter: 'blur(2px)',
                }}
                animate={{
                  rotate: 360,
                  transition: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
              />
              
              {/* 中心点 */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.accent }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />

              {/* 浮动粒子 */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: colors.accent,
                    top: '50%',
                    left: '50%',
                    transformOrigin: `${30 + i * 8}px 0px`,
                  }}
                  animate={{
                    rotate: 360,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }
                  }}
                />
              ))}
            </div>

            {/* 当前步骤信息 */}
            <motion.div
              className="text-center"
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className={`${config.text} font-semibold ${colors.text} mb-2 font-inter`}>
                {currentStepData.title}
              </h3>
              <p className={`text-sm ${colors.subText} font-inter`}>
                {currentStepData.description}
              </p>
            </motion.div>
          </div>

          {/* 进度条 */}
          {showProgress && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${colors.subText} font-inter`}>
                  Progress
                </span>
                <span className={`text-sm font-semibold ${colors.text} font-mono`}>
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className={`relative ${config.progress} bg-gray-200/30 rounded-full overflow-hidden`}>
                <motion.div
                  className={`absolute left-0 top-0 h-full rounded-full`}
                  style={{
                    background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}dd)`,
                    boxShadow: `0 0 10px ${colors.accentRgb}`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                
                {/* 进度条光效 */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-8 opacity-50"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${colors.accent}aa, transparent)`,
                    filter: 'blur(1px)',
                  }}
                  animate={{
                    x: [-32, progress * 5],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* 步骤指示器 */}
          <motion.div
            className="flex justify-center space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`
                  w-2 h-2 rounded-full transition-colors duration-300
                  ${index <= currentStepIndex 
                    ? `bg-[${colors.accent}]` 
                    : 'bg-gray-300/50'
                  }
                `}
                animate={{
                  scale: index === currentStepIndex ? [1, 1.5, 1] : 1,
                  transition: {
                    duration: 1,
                    repeat: index === currentStepIndex ? Infinity : 0,
                    ease: "easeInOut"
                  }
                }}
              />
            ))}
          </motion.div>

          {/* 完成状态 */}
          {animationPhase === 'completed' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    transition: { duration: 1, repeat: Infinity }
                  }}
                >
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Complete!</h3>
                <p className="text-gray-600">Redirecting to your results...</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}