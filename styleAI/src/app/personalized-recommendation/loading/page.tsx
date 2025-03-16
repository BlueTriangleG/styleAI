'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RecommendationHeader } from '@/components/recommendation/Header';
import LiquidChrome from '@/components/background/LiquidChrome';

import { apiService } from '@/lib/api/ApiService';

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userImageExists, setUserImageExists] = useState<boolean | null>(null);
  const [jobId, setJobId] = useState<string>('');
  const jobCreatedRef = useRef<boolean>(false);
  const dataFetchedRef = useRef<boolean>(false);
  const [isDataReady, setIsDataReady] = useState(false);

  // 获取个性化分析数据
  const fetchAnalysisData = async (jobId: string) => {
    // 如果数据已经获取过，则直接返回
    if (dataFetchedRef.current) {
      console.log('数据已经获取过，不再重复获取');
      return;
    }

    try {
      console.log('正在从API获取个性化分析数据...');
      const data = await apiService.getPersonalizedAnalysis(jobId);
      console.log('成功获取个性化分析数据:', data);

      // 将数据存储在sessionStorage中
      sessionStorage.setItem('analysisData', JSON.stringify(data));
      console.log('分析数据已存储到sessionStorage');

      // 调用wear-suit-pictures接口
      console.log('正在调用wear-suit-pictures接口...');
      try {
        const suitPicturesResult = await apiService.getWearSuitPictures(jobId);
        console.log('成功获取穿着建议图片:', suitPicturesResult);

        // 如果成功获取穿着建议图片，则获取最佳匹配图片
        console.log('正在获取最佳匹配图片...');
        let bestFitImageObtained = false;
        try {
          const bestFitResult = await apiService.getBestFitImage(jobId);
          console.log('成功获取最佳匹配图片:', bestFitResult);

          // 将最佳匹配图片存储在sessionStorage中
          if (bestFitResult && bestFitResult.imageData) {
            const base64Image = `data:image/jpeg;base64,${bestFitResult.imageData}`;
            sessionStorage.setItem('bestFitImage', base64Image);
            console.log('最佳匹配图片已存储到sessionStorage');
            bestFitImageObtained = true;
          }
        } catch (bestFitError) {
          console.error('获取最佳匹配图片失败:', bestFitError);
          // 尝试生成最佳匹配图片
          try {
            console.log('尝试生成最佳匹配图片...');
            const generateResult = await apiService.generateBestFit(jobId);
            console.log('生成最佳匹配图片结果:', generateResult);

            if (generateResult && generateResult.status === 'success') {
              // 再次尝试获取最佳匹配图片
              console.log('再次尝试获取最佳匹配图片...');
              const retryResult = await apiService.getBestFitImage(jobId);

              if (retryResult && retryResult.imageData) {
                const base64Image = `data:image/jpeg;base64,${retryResult.imageData}`;
                sessionStorage.setItem('bestFitImage', base64Image);
                console.log('最佳匹配图片已存储到sessionStorage');
                bestFitImageObtained = true;
              }
            }
          } catch (generateError) {
            console.error('生成最佳匹配图片失败:', generateError);
          }
        }

        // 标记数据已准备好
        setIsDataReady(true);
        dataFetchedRef.current = true;

        // 即使没有获取到最佳匹配图片，也继续流程
        // 在step2页面会再次尝试获取
        return data;
      } catch (suitPicturesError) {
        console.error('获取穿着建议图片失败:', suitPicturesError);
        // 标记数据已准备好，继续流程
        setIsDataReady(true);
        dataFetchedRef.current = true;
        return data;
      }
    } catch (error) {
      console.error('获取个性化分析数据失败:', error);
      // 标记数据已准备好，继续流程
      setIsDataReady(true);
      dataFetchedRef.current = true;
      return null;
    }
  };

  // 创建job记录并获取分析数据
  const createJobAndFetchData = async (imageData: string) => {
    // 如果已经创建过job，则不再创建
    if (jobCreatedRef.current) {
      console.log('已经创建过job记录，不再重复创建');
      return;
    }

    // 标记job已创建，防止重复调用
    jobCreatedRef.current = true;

    try {
      console.log('正在创建job记录...');
      // 创建job记录
      const newJobId = await apiService.createJob(imageData);
      console.log(`成功创建job记录，ID: ${newJobId}`);

      // 设置jobId
      setJobId(newJobId);

      // 将jobId存储在sessionStorage中，以便在step2页面使用
      sessionStorage.setItem('currentJobId', newJobId);

      // 如果数据已经获取过，则不再重复获取
      if (dataFetchedRef.current) {
        console.log('数据已经获取过，不再重复获取');
        return;
      }

      // 获取分析数据
      await fetchAnalysisData(newJobId);
    } catch (error) {
      console.error('创建job记录失败:', error);
      // 如果创建job失败，生成一个临时的jobId
      const tempJobId = `temp-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      console.log(`使用临时jobId: ${tempJobId}`);
      setJobId(tempJobId);
      sessionStorage.setItem('currentJobId', tempJobId);

      // 如果数据已经获取过，则不再重复获取
      if (dataFetchedRef.current) {
        console.log('数据已经获取过，不再重复获取');
        return;
      }

      // 使用临时ID获取分析数据
      await fetchAnalysisData(tempJobId);
    }
  };

  useEffect(() => {
    console.log('LoadingPage组件已加载');

    // 检查用户图像是否存在
    if (typeof window !== 'undefined') {
      try {
        const userImage = sessionStorage.getItem('userImage');
        console.log(
          '从sessionStorage获取的图像:',
          userImage ? '存在' : '不存在'
        );

        if (!userImage) {
          console.log('未找到用户图像，重定向到step1');
          setUserImageExists(false);
          router.replace('/personalized-recommendation/step1');
          return;
        }

        setUserImageExists(true);

        // 创建job记录并获取分析数据
        createJobAndFetchData(userImage);
      } catch (error) {
        console.error('访问sessionStorage时出错:', error);
        router.replace('/personalized-recommendation/step1');
        return;
      }
    }

    // 模拟加载进度
    console.log('开始模拟加载进度');
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 5; // 减小增量，延长加载时间
        console.log('当前进度:', Math.min(newProgress, 100).toFixed(1) + '%');

        // 如果进度达到100%且数据已准备好，则跳转到step2
        if (newProgress >= 100 && dataFetchedRef.current) {
          console.log('加载完成且数据已准备好，准备跳转到step2');
          clearInterval(interval);
          // 开始过渡动画
          setIsTransitioning(true);

          // 延长跳转时间，确保动画有足够时间显示
          setTimeout(() => {
            console.log('执行跳转到step2');
            router.replace('/personalized-recommendation/step2');
          }, 100); // 增加到1000ms
          return 100;
        }

        // 如果进度达到95%但数据还未准备好，则保持在95%
        if (newProgress >= 95 && !dataFetchedRef.current) {
          console.log('进度达到95%，等待数据准备完成...');
          return 95;
        }

        return Math.min(newProgress, 100);
      });
    }, 400); // 增加间隔时间，使进度条更新更慢

    return () => {
      console.log('LoadingPage组件卸载，清除interval');
      clearInterval(interval);
    };
  }, [router]);

  // 动画变体
  const pageVariants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.5 } },
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

  // 如果userImageExists为null或false，显示简单的加载指示器
  if (userImageExists === null || userImageExists === false) {
    return (
      <>
        <RecommendationHeader />
        <div className="min-h-screen flex items-center justify-center">
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
            <p className="text-gray-600 font-inter">
              {userImageExists === false
                ? '重定向到上传页面...'
                : '正在加载...'}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RecommendationHeader />
      {/* 流动背景 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
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
        animate={isTransitioning ? 'exit' : 'animate'} // 修改这里，确保动画正确播放
        variants={pageVariants}>
        {/* 内容区域 */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto flex flex-col items-center justify-center"
            initial="initial"
            animate="animate" // 确保子元素动画播放
            variants={containerVariants}>
            <motion.div className="mb-8 text-center" variants={itemVariants}>
              <h1 className="text-3xl font-bold mb-2 font-playfair text-gray-800">
                分析您的风格
              </h1>
              <p className="text-lg text-gray-600 font-inter">
                我们正在处理您的照片，为您创建个性化推荐
              </p>
            </motion.div>

            <motion.div className="w-full mb-8" variants={itemVariants}>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-[#84a59d] h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-right text-sm text-gray-600 font-inter">
                {Math.min(Math.round(progress), 100)}%
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
                  <li>✓ 确定您的风格偏好</li>
                  <li>{progress >= 50 ? '✓' : '⋯'} 识别您的风格特点</li>
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
