'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingStage {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedDuration: number;
}

interface EnhancedLoadingOverlayProps {
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
    icon: '📸',
    estimatedDuration: 2000,
  },
  {
    id: 'analyze',
    title: 'AI Analysis',
    description: 'Running advanced style analysis',
    icon: '🧠',
    estimatedDuration: 5000,
  },
  {
    id: 'generate',
    title: 'Generating Results',
    description: 'Creating personalized recommendations',
    icon: '✨',
    estimatedDuration: 3000,
  },
  {
    id: 'finalize',
    title: 'Finalizing',
    description: 'Preparing your style report',
    icon: '📊',
    estimatedDuration: 1000,
  },
];

export function EnhancedLoadingOverlay({
  isVisible,
  currentStage,
  progress: externalProgress,
  onComplete,
  stages = defaultStages,
  title = 'StyleAI Processing',
  subtitle = 'Creating your personalized style analysis',
  theme = 'gradient',
}: EnhancedLoadingOverlayProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const progress = externalProgress ?? internalProgress;
  const currentStageData = stages[currentStageIndex];

  // 自动进度模拟
  useEffect(() => {
    if (!isVisible || externalProgress !== undefined) return;

    const interval = setInterval(() => {
      setInternalProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 2, 95);
        
        // 更新阶段
        const newStageIndex = Math.floor((newProgress / 100) * stages.length);
        setCurrentStageIndex(Math.min(newStageIndex, stages.length - 1));
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, externalProgress, stages.length]);

  // 当前阶段更新
  useEffect(() => {
    if (currentStage) {
      const stageIndex = stages.findIndex(stage => stage.id === currentStage);
      if (stageIndex !== -1) {
        setCurrentStageIndex(stageIndex);
      }
    }
  }, [currentStage, stages]);

  // 粒子效果
  useEffect(() => {
    if (!isVisible) return;

    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // 完成检测
  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    }
  }, [progress, onComplete]);

  // 主题配置
  const themeConfig = {
    light: {
      background: 'bg-white/95 backdrop-blur-xl',
      overlay: 'bg-gray-50/80',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      accent: '#84a59d',
      gradient: 'from-white/95 to-gray-50/95',
    },
    dark: {
      background: 'bg-gray-900/95 backdrop-blur-xl',
      overlay: 'bg-gray-800/80',
      text: 'text-white',
      subtext: 'text-gray-300',
      accent: '#84a59d',
      gradient: 'from-gray-900/95 to-gray-800/95',
    },
    gradient: {
      background: 'bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-xl',
      overlay: 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10',
      text: 'text-white',
      subtext: 'text-white/80',
      accent: '#84a59d',
      gradient: 'from-purple-600/20 via-blue-600/20 to-indigo-600/20',
    },
  };

  const colors = themeConfig[theme];

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
          <div className={`absolute inset-0 ${colors.background}`}>
            {/* 粒子背景 */}
            <div className="absolute inset-0 overflow-hidden">
              {particles.map(particle => (
                <motion.div
                  key={particle.id}
                  className="absolute w-1 h-1 bg-white/20 rounded-full"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: particle.id * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* 动态背景波纹 */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${colors.accent}20 0%, transparent 50%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          {/* 主内容容器 */}
          <motion.div
            className="relative z-10 max-w-md w-full mx-4"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -50 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* 主卡片 */}
            <div className={`relative p-8 rounded-3xl shadow-2xl ${colors.overlay} border border-white/10`}>
              {/* 装饰性边框动画 */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `linear-gradient(45deg, ${colors.accent}40, transparent, ${colors.accent}40)`,
                  padding: '2px',
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className={`w-full h-full rounded-3xl ${colors.overlay}`} />
              </motion.div>

              {/* 内容 */}
              <div className="relative z-10">
                {/* 标题 */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className={`text-3xl font-bold ${colors.text} font-playfair mb-2`}>
                    {title}
                  </h1>
                  <p className={`${colors.subtext} font-inter`}>
                    {subtitle}
                  </p>
                </motion.div>

                {/* 主要动画区域 */}
                <div className="flex flex-col items-center mb-8">
                  {/* 中央加载动画 */}
                  <div className="relative w-32 h-32 mb-6">
                    {/* 外环 */}
                    <motion.div
                      className="absolute inset-0 border-4 border-white/20 rounded-full"
                      style={{ borderTopColor: colors.accent }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* 中环 */}
                    <motion.div
                      className="absolute inset-4 border-3 border-white/10 rounded-full"
                      style={{ borderRightColor: colors.accent }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* 内环光效 */}
                    <motion.div
                      className="absolute inset-8 rounded-full"
                      style={{
                        background: `conic-gradient(from 0deg, transparent, ${colors.accent}60, transparent)`,
                        filter: 'blur(4px)',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
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
                      <span className="text-4xl">
                        {currentStageData?.icon || '⚡'}
                      </span>
                    </motion.div>

                    {/* 环绕粒子 */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/60 rounded-full"
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

                  {/* 当前阶段信息 */}
                  <motion.div
                    className="text-center"
                    key={currentStageIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className={`text-xl font-semibold ${colors.text} mb-2 font-inter`}>
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-sm ${colors.subtext} font-inter`}>
                      Progress
                    </span>
                    <span className={`text-sm font-bold ${colors.text} font-mono`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                    {/* 背景轨道光效 */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${colors.accent}20, transparent)`,
                      }}
                      animate={{
                        x: [-100, 400],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    
                    {/* 主进度条 */}
                    <motion.div
                      className="absolute left-0 top-0 h-full rounded-full relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${colors.accent}dd, ${colors.accent}, ${colors.accent}dd)`,
                        boxShadow: `0 0 20px ${colors.accent}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ 
                        duration: 0.8, 
                        ease: [0.4, 0, 0.2, 1] // Custom easing for smoother animation
                      }}
                    >
                      {/* 进度条内部高光 */}
                      <motion.div
                        className="absolute top-0 left-0 h-full w-full"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)`,
                        }}
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      
                      {/* 进度条顶部反光 */}
                      <div 
                        className="absolute top-0 left-0 h-1/2 w-full rounded-full"
                        style={{
                          background: `linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)`,
                        }}
                      />
                    </motion.div>
                    
                    {/* 进度条末端光点 */}
                    {progress > 0 && (
                      <motion.div
                        className="absolute top-1/2 h-5 w-5 rounded-full -translate-y-1/2"
                        style={{
                          left: `${progress}%`,
                          background: `radial-gradient(circle, ${colors.accent}, transparent)`,
                          filter: 'blur(2px)',
                          marginLeft: '-10px',
                        }}
                        animate={{
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </div>
                </motion.div>

                {/* 阶段指示器 */}
                <motion.div
                  className="flex justify-center space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {stages.map((stage, index) => (
                    <motion.div
                      key={stage.id}
                      className={`
                        relative w-3 h-3 rounded-full transition-all duration-300
                        ${index <= currentStageIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/30'
                        }
                      `}
                      animate={{
                        scale: index === currentStageIndex ? [1, 1.4, 1] : 1,
                        boxShadow: index === currentStageIndex 
                          ? [`0 0 0 rgba(255,255,255,0)`, `0 0 20px rgba(255,255,255,0.8)`, `0 0 0 rgba(255,255,255,0)`]
                          : '0 0 0 rgba(255,255,255,0)',
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: index === currentStageIndex ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>

                {/* 完成动画 */}
                {progress >= 100 && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-400/90 to-emerald-500/90 rounded-3xl"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <motion.div
                      className="text-center"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2 font-playfair">Analysis Complete!</h3>
                      <p className="text-white/90 font-inter">Redirecting to your results...</p>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}