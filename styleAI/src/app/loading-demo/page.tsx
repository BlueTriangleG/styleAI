'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EnhancedLoadingOverlay } from '@/components/loading/EnhancedLoadingOverlay';
import { CleanLoadingOverlay } from '@/components/loading/CleanLoadingOverlay';
import { PremiumLoadingSystem } from '@/components/loading/PremiumLoadingSystem';

/**
 * Loading Demo Page
 * 
 * 用于调试和展示各种loading动画效果
 */
export default function LoadingDemoPage() {
  const [currentDemo, setCurrentDemo] = useState<'overlay' | 'clean' | 'premium'>('clean');
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('upload');
  const [isPlaying, setIsPlaying] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'gradient'>('light');

  // Demo stages
  const demoStages = [
    {
      id: 'upload',
      title: 'Processing Upload',
      description: 'Analyzing your uploaded image',
      icon: 'upload' as const,
      estimatedDuration: 2000,
    },
    {
      id: 'api-connect',
      title: 'AI Connection',
      description: 'Connecting to analysis servers',
      icon: 'api-connect' as const,
      estimatedDuration: 1500,
    },
    {
      id: 'analysis',
      title: 'Deep Analysis', 
      description: 'AI analyzing your style features',
      icon: 'analysis' as const,
      estimatedDuration: 4000,
    },
    {
      id: 'recommendations',
      title: 'Style Matching',
      description: 'Generating personalized recommendations',
      icon: 'recommendations' as const,
      estimatedDuration: 2500,
    },
    {
      id: 'finalize',
      title: 'Final Touches',
      description: 'Preparing your complete report',
      icon: 'finalize' as const,
      estimatedDuration: 1000,
    },
  ];

  const demoSteps = [
    {
      id: 'upload',
      title: 'Processing Upload',
      description: 'Analyzing your uploaded image and preparing for AI processing',
      duration: 2000,
    },
    {
      id: 'api-connect',
      title: 'Connecting to AI',
      description: 'Establishing connection with our advanced AI analysis system',
      duration: 1500,
    },
    {
      id: 'analysis',
      title: 'AI Style Analysis',
      description: 'Running deep learning algorithms to understand your unique style',
      duration: 4000,
    },
    {
      id: 'recommendations',
      title: 'Generating Recommendations',
      description: 'Creating personalized style suggestions based on your features',
      duration: 2500,
    },
    {
      id: 'finalize',
      title: 'Finalizing Report',
      description: 'Preparing your comprehensive style analysis report',
      duration: 1000,
    },
  ];

  // 自动进度模拟
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 3;
        
        // 更新阶段
        const stageIndex = Math.floor((newProgress / 100) * demoStages.length);
        const stage = demoStages[Math.min(stageIndex, demoStages.length - 1)];
        setCurrentStage(stage.id);
        
        // 重置进度当达到100%
        if (newProgress >= 100) {
          setTimeout(() => setProgress(0), 2000);
          return 100;
        }
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, demoStages]);

  const resetDemo = () => {
    setProgress(0);
    setCurrentStage('upload');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 控制面板 */}
      <div className="fixed top-4 left-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-bold text-white">Loading Demo</h1>
          
          {/* Demo类型选择 */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDemo('clean')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentDemo === 'clean' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Clean Loading
            </button>
            <button
              onClick={() => setCurrentDemo('overlay')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentDemo === 'overlay' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Enhanced Overlay
            </button>
            <button
              onClick={() => setCurrentDemo('premium')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentDemo === 'premium' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Premium System
            </button>
          </div>

          {/* 主题选择 */}
          <div className="flex gap-2">
            {(['light', 'dark', 'gradient'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  theme === t 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* 控制按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                isPlaying 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={resetDemo}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
            >
              Reset
            </button>
          </div>

          {/* 进度显示 */}
          <div className="text-sm text-gray-300">
            Progress: {Math.round(progress)}% | Stage: {currentStage}
          </div>
        </div>
      </div>

      {/* Demo展示区域 */}
      <div className="pt-20">
        {currentDemo === 'clean' && (
          <CleanLoadingOverlay
            isVisible={true}
            currentStage={currentStage}
            progress={progress}
            stages={demoStages}
            title="Demo: Clean Loading"
            subtitle="Optimized loading experience"
            theme={theme}
          />
        )}

        {currentDemo === 'overlay' && (
          <EnhancedLoadingOverlay
            isVisible={true}
            currentStage={currentStage}
            progress={progress}
            stages={demoStages}
            title="Demo: Enhanced Loading"
            subtitle="Testing loading overlay animations"
            theme={theme}
          />
        )}

        {currentDemo === 'premium' && (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <PremiumLoadingSystem
              steps={demoSteps}
              currentStep={currentStage}
              progress={progress}
              showProgress={true}
              theme={theme === 'dark' ? 'dark' : 'light'}
              size="lg"
            />
          </div>
        )}
      </div>

      {/* 说明文档 */}
      <motion.div
        className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h3 className="font-bold text-white mb-2">Loading Demo Controls</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Switch between different loading components</li>
          <li>• Test different themes (Light/Dark/Gradient)</li>
          <li>• Control playback and reset progress</li>
          <li>• Observe stage transitions and animations</li>
        </ul>
        
        <div className="mt-3 pt-3 border-t border-gray-600">
          <h4 className="font-semibold text-white text-sm mb-1">Current Features:</h4>
          <ul className="text-xs text-gray-400 space-y-0.5">
            <li>✨ Enhanced progress bar with shimmer effects</li>
            <li>🎯 Smooth stage transitions</li>
            <li>💫 Particle animations</li>
            <li>🌈 Multiple theme support</li>
            <li>📱 Responsive design</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}