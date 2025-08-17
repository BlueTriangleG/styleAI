import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  extractFeatures,
  extractColors,
  extractStyles,
} from '@/utils/analysisDataExtractor';
import {
  defaultAnalysisPoints,
  defaultColors,
  defaultStyles,
  AnalysisPoint,
} from '@/constants/defaultAnalysisData';
import { getJobDescription } from '@/app/actions/jobActions';

interface AnalysisData {
  features: AnalysisPoint[];
  colors: { name: string; hex: string }[];
  styles: string[];
}

interface UseJobDescriptionReturn {
  analysisData: AnalysisData | null;
  rawAnalysisData: any | null; // 原始分析数据
  isLoading: boolean;
  error: string | null;
  overallDescription: string;
  jobId: string;
}

export const useJobDescription = (): UseJobDescriptionReturn => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [rawAnalysisData, setRawAnalysisData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallDescription, setOverallDescription] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window === 'undefined') return;

      try {
        console.log('获取job description数据');

        // 获取jobId - 从sessionStorage获取jobId，用于后续API调用
        const jobIdFromStorage = sessionStorage.getItem('currentJobId');
        if (!jobIdFromStorage) {
          console.log('未找到jobId，无法获取分析数据');
          setError('未找到jobId，无法获取分析数据');
          setIsLoading(false);
          return;
        }

        setJobId(jobIdFromStorage);
        console.log(`使用jobId: ${jobIdFromStorage}`);

        // 获取分析数据
        await fetchAnalysisData(jobIdFromStorage);
      } catch (error) {
        console.error('获取数据时出错:', error);
        setError('获取数据失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchAnalysisData = async (jobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`正在获取分析数据，jobId: ${jobId}`);

      // 调用server action获取分析数据
      const descriptionResult = await getJobDescription(jobId);

      if (
        descriptionResult.status === 'success' &&
        descriptionResult.description
      ) {
        console.log('成功获取分析数据');
        await processAnalysisData(descriptionResult.description);
      } else {
        console.error('获取分析数据失败:', descriptionResult.error);
        throw new Error(descriptionResult.error || '获取分析数据失败');
      }
    } catch (error) {
      console.error('处理分析数据失败:', error);
      setError('无法处理分析数据，使用默认数据');
      setAnalysisData({
        features: defaultAnalysisPoints,
        colors: defaultColors,
        styles: defaultStyles,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalysisData = async (parsedData: any) => {
    try {
      console.log('开始处理分析数据');
      console.log('数据结构:', Object.keys(parsedData));

      // 保存原始分析数据
      setRawAnalysisData(parsedData);

      // 提取整体描述
      if (parsedData && parsedData['Your Overall Description']) {
        const description = parsedData['Your Overall Description'];
        console.log('提取到的整体描述:', description);
        // 只有当描述真的不同时才更新状态
        setOverallDescription(prev => prev !== description ? description : prev);
      } else {
        console.log('未找到整体描述');
        const defaultDesc = '未找到整体描述';
        setOverallDescription(prev => prev !== defaultDesc ? defaultDesc : prev);
      }

      // 使用工具函数提取数据
      const extractedFeatures = extractFeatures(parsedData);
      const extractedColors = extractColors(parsedData);
      const extractedStyles = extractStyles(parsedData);

      console.log('提取的特征数量:', extractedFeatures.length);
      console.log('提取的颜色数量:', extractedColors.length);
      console.log('提取的风格数量:', extractedStyles.length);

      // 构建处理后的数据
      const processedData = {
        features:
          extractedFeatures.length > 0
            ? extractedFeatures
            : defaultAnalysisPoints,
        colors: extractedColors.length > 0 ? extractedColors : defaultColors,
        styles: extractedStyles.length > 0 ? extractedStyles : defaultStyles,
      };

      console.log('提取的特征:', processedData.features);
      console.log('提取的颜色:', processedData.colors);
      console.log('提取的风格:', processedData.styles);

      // 只有当数据真的不同时才更新状态
      setAnalysisData(prev => {
        if (!prev) return processedData;
        
        // 深度比较来避免不必要的更新
        const isSame = JSON.stringify(prev) === JSON.stringify(processedData);
        return isSame ? prev : processedData;
      });

      // 存储到sessionStorage以备后用
      sessionStorage.setItem('analysisData', JSON.stringify(parsedData));
    } catch (parseError) {
      console.error('解析分析数据时出错:', parseError);
      throw parseError;
    }
  };

  return {
    analysisData,
    rawAnalysisData,
    isLoading,
    error,
    overallDescription,
    jobId,
  };
};
