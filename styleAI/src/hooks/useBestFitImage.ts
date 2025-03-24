import { useState, useEffect } from 'react';
import { getBestFitImage } from '@/app/actions/jobActions';

interface UseBestFitImageReturn {
  bestFitImage: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useBestFitImage = (): UseBestFitImageReturn => {
  const [bestFitImage, setBestFitImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (typeof window === 'undefined') return;

      try {
        console.log('获取best fit图片数据');

        // 获取jobId
        const jobIdFromStorage = sessionStorage.getItem('currentJobId');
        if (!jobIdFromStorage) {
          console.log('未找到jobId，无法获取最佳匹配图片');
          setError('未找到jobId，无法获取最佳匹配图片');
          setIsLoading(false);
          return;
        }

        // 获取图片
        await fetchBestFitImage(jobIdFromStorage);
      } catch (error) {
        console.error('获取best fit图片时出错:', error);
        setError('获取最佳匹配图片失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, []);

  const fetchBestFitImage = async (jobId: string) => {
    try {
      console.log(`正在获取最佳匹配图片，jobId: ${jobId}`);

      // 调用server action获取最佳匹配图片
      const bestFitResult = await getBestFitImage(jobId);

      if (bestFitResult.status === 'success' && bestFitResult.imageData) {
        // 将Base64图片数据转换为Data URL
        const imageDataUrl = `data:image/jpeg;base64,${bestFitResult.imageData}`;
        setBestFitImage(imageDataUrl);
        console.log('成功设置最佳匹配图片');

        // 存储到sessionStorage以备后用
        sessionStorage.setItem('bestFitImage', imageDataUrl);
      } else {
        console.log('获取最佳匹配图片失败:', bestFitResult.error);
        setError(bestFitResult.error || '获取最佳匹配图片失败');
      }
    } catch (error) {
      console.error('获取最佳匹配图片时出错:', error);
      setError('获取最佳匹配图片失败');
      throw error;
    }
  };

  return {
    bestFitImage,
    isLoading,
    error,
  };
};
