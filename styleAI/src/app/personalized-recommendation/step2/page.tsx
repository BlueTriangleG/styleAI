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
  const [overallDescription, setOverallDescription] = useState<string>(''); // 存储整体描述
  const [bestFitImage, setBestFitImage] = useState<string | null>(null); // 存储最佳匹配图片
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

  // 辅助函数：从原始JSON字符串中提取有效的JSON内容
  const extractJsonFromString = (jsonString: string): any => {
    console.log('提取JSON，原始字符串长度:', jsonString.length);

    try {
      // 首先检查是否是有效的JSON对象
      if (typeof jsonString === 'object' && jsonString !== null) {
        console.log('输入已经是对象，直接返回');
        return jsonString;
      }

      // 确保输入是字符串
      if (typeof jsonString !== 'string') {
        console.log('输入不是字符串，尝试转换为字符串');
        jsonString = String(jsonString);
      }

      // 首先尝试直接解析，看是否已经是有效的JSON字符串
      try {
        const directParsed = JSON.parse(jsonString);
        console.log('直接解析成功，返回对象');
        return directParsed;
      } catch (e) {
        console.log('直接解析失败，尝试提取JSON代码块');
      }

      // 检查是否包含```json标记
      if (jsonString.includes('```json')) {
        console.log('检测到```json标记，尝试提取JSON内容');

        // 提取JSON部分 - 使用更精确的方法
        const startMarker = '```json\n';
        const endMarker = '\n```';

        const startIndex = jsonString.indexOf(startMarker);
        if (startIndex !== -1) {
          const contentStartIndex = startIndex + startMarker.length;
          const endIndex = jsonString.indexOf(endMarker, contentStartIndex);

          if (endIndex !== -1) {
            const jsonContent = jsonString.substring(
              contentStartIndex,
              endIndex
            );
            console.log('提取的JSON内容长度:', jsonContent.length);
            console.log('JSON内容前20个字符:', jsonContent.substring(0, 20));

            // 解析JSON
            try {
              const parsed = JSON.parse(jsonContent);
              console.log('JSON解析成功，返回对象');
              return parsed;
            } catch (parseError) {
              console.error('解析提取的JSON内容失败:', parseError);
              // 继续尝试其他方法
            }
          }
        }
      }

      // 如果上述方法都失败，尝试移除所有Markdown标记
      console.log('尝试移除所有Markdown标记');
      const cleanedJson = jsonString
        .replace(/```json\n/g, '')
        .replace(/\n```/g, '')
        .trim();

      console.log('清理后的JSON长度:', cleanedJson.length);
      console.log('清理后的JSON前20个字符:', cleanedJson.substring(0, 20));

      // 解析清理后的JSON
      try {
        const parsed = JSON.parse(cleanedJson);
        console.log('清理后的JSON解析成功，返回对象');
        return parsed;
      } catch (parseError) {
        console.error('解析清理后的JSON失败:', parseError);
        // 继续尝试其他方法
      }

      // 如果所有方法都失败，返回一个空对象
      console.log('所有解析方法都失败，返回空对象');
      return {};
    } catch (error) {
      console.error('提取JSON过程中出错:', error);
      return {};
    }
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
      let parsedData;
      try {
        // 尝试解析数据
        console.log('原始存储的数据长度:', storedData.length);

        // 使用辅助函数提取JSON
        parsedData = extractJsonFromString(storedData);
        console.log('成功解析的数据结构:', Object.keys(parsedData));

        // 提取并设置整体描述
        if (parsedData && parsedData['Your Overall Description']) {
          const description = parsedData['Your Overall Description'];
          console.log('提取到的整体描述:', description);
          setOverallDescription(description);
        } else {
          console.log('未找到整体描述');
          setOverallDescription('未找到整体描述');
        }

        // 检查parsedData是否为有效对象
        if (!parsedData || typeof parsedData !== 'object') {
          console.error('解析后的数据不是有效对象:', parsedData);
          throw new Error('解析后的数据不是有效对象');
        }

        // 从结构化数据中提取特征、颜色和风格
        const extractedFeatures: AnalysisPoint[] = [];
        const extractedColors: { name: string; hex: string }[] = [];
        const extractedStyles: string[] = [];

        console.log('开始提取特征数据');

        // 提取结构化特征
        if (parsedData['Structural Features']) {
          console.log('提取Structural Features');
          try {
            // 提取身体特征
            if (parsedData['Structural Features']['Body Features']) {
              const bodyFeatures =
                parsedData['Structural Features']['Body Features'];
              console.log('Body Features类型:', typeof bodyFeatures);

              if (typeof bodyFeatures === 'object' && bodyFeatures !== null) {
                for (const [key, value] of Object.entries(bodyFeatures)) {
                  if (typeof value === 'string') {
                    extractedFeatures.push({
                      title: key,
                      content: value,
                    });
                  } else if (value && typeof value === 'object') {
                    // 处理嵌套对象，如Body Hair Characteristics
                    for (const [nestedKey, nestedValue] of Object.entries(
                      value
                    )) {
                      if (typeof nestedValue === 'string') {
                        extractedFeatures.push({
                          title: `${key} - ${nestedKey}`,
                          content: nestedValue,
                        });
                      }
                    }
                  }
                }
              }
            }

            // 提取面部特征
            if (parsedData['Structural Features']['Facial Features']) {
              const facialFeatures =
                parsedData['Structural Features']['Facial Features'];
              console.log('Facial Features类型:', typeof facialFeatures);

              if (
                typeof facialFeatures === 'object' &&
                facialFeatures !== null
              ) {
                for (const [key, value] of Object.entries(facialFeatures)) {
                  if (typeof value === 'string') {
                    extractedFeatures.push({
                      title: key,
                      content: value,
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.error('处理Structural Features时出错:', e);
          }
        }

        // 提取颜色特征
        if (parsedData['Color Features']) {
          const colorFeatures = parsedData['Color Features'];
          console.log('Color Features类型:', typeof colorFeatures);

          try {
            // 添加肤色
            if (colorFeatures['Skin Tone and Visual Characteristics']) {
              const skinTone =
                colorFeatures['Skin Tone and Visual Characteristics'];
              console.log('提取肤色:', skinTone);
              extractedColors.push({
                name: 'Skin Tone',
                hex: '#FFE0BD', // 默认肤色
              });
            }

            // 添加发色
            if (colorFeatures['Hair Color and Saturation']) {
              const hairColor = colorFeatures['Hair Color and Saturation'];
              console.log('提取发色:', hairColor);
              extractedColors.push({
                name: 'Hair Color',
                hex: '#4A4A4A', // 默认发色
              });
            }

            // 添加服装颜色建议
            if (colorFeatures['Clothing Color Optimization Suggestions']) {
              // 从建议中提取颜色名称
              const suggestion =
                colorFeatures['Clothing Color Optimization Suggestions'];
              console.log('提取服装颜色建议:', suggestion);
              const colorRegex =
                /(black|white|red|green|blue|yellow|purple|pink|orange|brown|gray|navy|burgundy|forest green|charcoal|pastel|neutral)/gi;
              const matches = suggestion.match(colorRegex);
              console.log('匹配到的颜色:', matches);

              if (matches) {
                // 为匹配到的颜色添加默认hex值
                const colorMap = {
                  black: '#000000',
                  white: '#FFFFFF',
                  red: '#FF0000',
                  green: '#008000',
                  blue: '#0000FF',
                  yellow: '#FFFF00',
                  purple: '#800080',
                  pink: '#FFC0CB',
                  orange: '#FFA500',
                  brown: '#A52A2A',
                  gray: '#808080',
                  navy: '#000080',
                  burgundy: '#800020',
                  'forest green': '#228B22',
                  charcoal: '#36454F',
                  pastel: '#FFB6C1',
                  neutral: '#F5F5DC',
                };

                // 添加唯一的颜色
                const addedColors = new Set<string>();
                matches.forEach((color: string) => {
                  const normalizedColor = color.toLowerCase();
                  if (
                    !addedColors.has(normalizedColor) &&
                    colorMap[normalizedColor as keyof typeof colorMap]
                  ) {
                    extractedColors.push({
                      name: color,
                      hex: colorMap[normalizedColor as keyof typeof colorMap],
                    });
                    addedColors.add(normalizedColor);
                  }
                });
              }
            }
          } catch (e) {
            console.error('处理Color Features时出错:', e);
          }
        }

        // 如果没有提取到足够的颜色，添加一些默认颜色
        if (extractedColors.length < 3) {
          console.log('提取的颜色不足3个，添加默认颜色');
          const defaultColors = [
            { name: 'Navy Blue', hex: '#000080' },
            { name: 'Burgundy', hex: '#800020' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Charcoal Gray', hex: '#36454F' },
          ];

          for (
            let i = 0;
            i < defaultColors.length && extractedColors.length < 4;
            i++
          ) {
            extractedColors.push(defaultColors[i]);
          }
        }

        // 提取风格特征
        if (
          parsedData['Semantic Features'] &&
          parsedData['Semantic Features']['Temperament Features']
        ) {
          const temperamentFeatures =
            parsedData['Semantic Features']['Temperament Features'];
          console.log('Temperament Features类型:', typeof temperamentFeatures);

          try {
            // 从整体风格印象中提取风格关键词
            if (temperamentFeatures['Overall Style First Impression']) {
              const impression =
                temperamentFeatures['Overall Style First Impression'];
              console.log('整体风格印象:', impression);
              const styleRegex =
                /(energetic|youthful|playful|artistic|elegant|sophisticated|classic|professional|casual|formal|sporty|creative|dynamic|vibrant)/gi;
              const matches = impression.match(styleRegex);
              console.log('从整体风格印象中匹配到的风格:', matches);

              if (matches) {
                matches.forEach((style: string) => {
                  if (!extractedStyles.includes(style)) {
                    extractedStyles.push(style);
                  }
                });
              }
            }

            // 从风格优化建议中提取风格关键词
            if (
              temperamentFeatures[
                'Style Optimization and Temperament Enhancement Suggestions'
              ]
            ) {
              const suggestion =
                temperamentFeatures[
                  'Style Optimization and Temperament Enhancement Suggestions'
                ];
              console.log('风格优化建议:', suggestion);
              const styleRegex =
                /(casual|playful|graphic tees|skirts|youthful|artistic|elegant|sophisticated|classic|professional|formal|sporty|creative|dynamic|vibrant)/gi;
              const matches = suggestion.match(styleRegex);
              console.log('从风格优化建议中匹配到的风格:', matches);

              if (matches) {
                matches.forEach((style: string) => {
                  if (!extractedStyles.includes(style)) {
                    extractedStyles.push(style);
                  }
                });
              }
            }
          } catch (e) {
            console.error('处理Temperament Features时出错:', e);
          }
        }

        // 如果没有提取到足够的风格，添加一些默认风格
        if (extractedStyles.length < 3) {
          console.log('提取的风格不足3个，添加默认风格');
          const defaultStyles = [
            'Classic',
            'Professional',
            'Elegant',
            'Sophisticated',
          ];
          for (
            let i = 0;
            i < defaultStyles.length && extractedStyles.length < 4;
            i++
          ) {
            if (!extractedStyles.includes(defaultStyles[i])) {
              extractedStyles.push(defaultStyles[i]);
            }
          }
        }

        // 如果features为空，添加整体描述作为一个特征
        if (
          extractedFeatures.length === 0 &&
          parsedData['Your Overall Description']
        ) {
          console.log('提取的特征为空，添加整体描述作为特征');
          try {
            const overallDescription = parsedData['Your Overall Description'];
            console.log('整体描述:', overallDescription);
            extractedFeatures.push({
              title: 'Overall Description',
              content: overallDescription,
            });
          } catch (e) {
            console.error('处理整体描述时出错:', e);
          }
        }

        console.log('提取完成，构建处理后的数据');
        console.log('提取的特征数量:', extractedFeatures.length);
        console.log('提取的颜色数量:', extractedColors.length);
        console.log('提取的风格数量:', extractedStyles.length);

        // 构建处理后的数据
        const processedData = {
          features:
            extractedFeatures.length > 0
              ? extractedFeatures
              : defaultAnalysisPoints,
          colors:
            extractedColors.length > 0
              ? extractedColors
              : [
                  { name: 'Navy Blue', hex: '#000080' },
                  { name: 'Burgundy', hex: '#800020' },
                  { name: 'Forest Green', hex: '#228B22' },
                  { name: 'Charcoal Gray', hex: '#36454F' },
                ],
          styles:
            extractedStyles.length > 0
              ? extractedStyles
              : ['Classic', 'Professional', 'Elegant', 'Sophisticated'],
        };

        // 打印分析数据的详细信息
        console.log('提取的特征:', processedData.features);
        console.log('提取的颜色:', processedData.colors);
        console.log('提取的风格:', processedData.styles);

        setAnalysisData(processedData);
        return processedData;
      } catch (parseError) {
        console.error('解析数据时出错:', parseError);
        throw parseError;
      }
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
    console.log('正在获取jobId和分析数据...');
    try {
      // 从sessionStorage获取jobId
      const storedJobId = sessionStorage.getItem('currentJobId');
      if (storedJobId) {
        console.log(`从sessionStorage获取到jobId: ${storedJobId}`);
        setJobId(storedJobId);
      } else {
        console.log('未找到jobId，使用默认值');
      }

      // 从sessionStorage获取用户图像
      const storedUserImage = sessionStorage.getItem('userImage');
      if (storedUserImage) {
        console.log('从sessionStorage获取到用户图像');
        setUserImage(storedUserImage);
      } else {
        console.log('未找到用户图像');
      }

      // 从sessionStorage获取分析数据
      const storedAnalysisData = sessionStorage.getItem('analysisData');
      if (storedAnalysisData) {
        console.log('从sessionStorage获取到分析数据');
        try {
          const parsedData = extractJsonFromString(storedAnalysisData);
          setAnalysisData(parsedData);
        } catch (error) {
          console.error('解析分析数据失败:', error);
          setAnalysisError('解析分析数据失败');
        }
      } else {
        console.log('未找到分析数据，使用默认数据');
        setAnalysisError('未找到分析数据，使用默认数据');
        setAnalysisData({
          features: defaultAnalysisPoints,
          colors: [
            { name: 'Navy Blue', hex: '#000080' },
            { name: 'Burgundy', hex: '#800020' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Charcoal Gray', hex: '#36454F' },
          ],
          styles: ['Classic', 'Professional', 'Elegant', 'Sophisticated'],
        });
      }

      // 从sessionStorage获取最佳匹配图片
      const storedBestFitImage = sessionStorage.getItem('bestFitImage');
      if (storedBestFitImage) {
        console.log('从sessionStorage获取到最佳匹配图片');
        setBestFitImage(storedBestFitImage);
      } else {
        console.log('未找到最佳匹配图片');
      }
    } catch (error) {
      console.error('获取数据时出错:', error);
      setAnalysisError('获取数据时出错');
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

        // 检查分析数据是否已存在于sessionStorage中
        const storedAnalysisData = sessionStorage.getItem('analysisData');
        if (storedAnalysisData) {
          console.log('在sessionStorage中找到分析数据');
          try {
            // 使用辅助函数提取JSON
            console.log('尝试解析sessionStorage中的分析数据');
            const parsedAnalysisData =
              extractJsonFromString(storedAnalysisData);
            console.log('解析的分析数据结构:', Object.keys(parsedAnalysisData));

            // 不直接设置分析数据，而是调用fetchAnalysisData来处理
            // 这样可以确保数据被正确处理
            console.log('调用fetchAnalysisData处理解析后的数据');
            fetchAnalysisData('')
              .then(() => {
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
              })
              .catch((error) => {
                console.error('fetchAnalysisData处理失败:', error);
                // 如果处理失败，仍然设置页面加载状态为false
                setIsPageLoading(false);
              });

            // 获取jobId
            const storedJobId = sessionStorage.getItem('currentJobId');
            if (storedJobId) {
              setJobId(storedJobId);
              console.log(`从sessionStorage获取的jobId: ${storedJobId}`);
            }

            return;
          } catch (e) {
            console.error('解析分析数据时出错:', e);
            // 如果解析出错，则继续使用getJobIdAndFetchData
          }
        } else {
          console.log('在sessionStorage中未找到分析数据');
        }

        // 如果没有找到分析数据或解析出错，则使用getJobIdAndFetchData
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

    // 确保features存在且是数组
    if (!analysisData.features || !Array.isArray(analysisData.features)) {
      console.error('分析数据中的features不存在或不是数组:', analysisData);
      // 使用默认数据
      setAnalysisData({
        ...analysisData,
        features: defaultAnalysisPoints,
      });
      return;
    }

    // 如果有整体描述，直接设置typingComplete为最大值，跳过分析点的动画
    if (overallDescription) {
      setTypingComplete(analysisData.features.length);
      // 直接显示滚动指示器
      setTimeout(() => {
        setShowScrollIndicator(true);
      }, 1000);
      return;
    }

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
  }, [isPageLoading, analysisData, overallDescription]);

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
  const recommendedColors = analysisData?.colors || [
    { name: 'Navy Blue', hex: '#000080' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Charcoal Gray', hex: '#36454F' },
  ];
  const recommendedStyles = analysisData?.styles || [
    'Classic',
    'Professional',
    'Elegant',
    'Sophisticated',
  ];

  // 构建风格推荐
  const styleRecommendations = defaultStyleRecommendations.map((rec, index) => {
    // 如果有推荐的风格，则使用它们
    if (recommendedStyles && recommendedStyles.length > index) {
      return {
        ...rec,
        title: recommendedStyles[index],
      };
    }
    return rec;
  });

  const analysisResults = {
    ...defaultAnalysisResults,
    // 如果有推荐的风格，则使用第一个作为styleMatch
    styleMatch:
      recommendedStyles && recommendedStyles.length > 0
        ? recommendedStyles[0]
        : defaultAnalysisResults.styleMatch,
  };

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
              speed={0.3}
              amplitude={0.7}
              frequencyX={4}
              frequencyY={3}
              interactive={false}
            />
            <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
          </div>

          <div className="container mx-auto px-4 py-8 relative z-10">
            <motion.h1
              className="text-3xl font-bold mb-8 text-center font-playfair text-gray-800"
              variants={itemVariants}>
              您的个性化分析
            </motion.h1>

            <div className="container max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* 左侧：用户图像和最佳匹配图片 */}
                <div className="flex flex-col items-center space-y-4">
                  {/* 用户图像和最佳匹配图片并排显示 */}
                  <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    {/* 用户图像 */}
                    {userImage && (
                      <div className="relative w-full max-w-[150px]">
                        <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-lg">
                          <Image
                            src={userImage}
                            alt="您的照片"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="mt-2 text-center text-sm text-gray-600">
                          您的照片
                        </div>
                      </div>
                    )}

                    {/* 最佳匹配图片 */}
                    {bestFitImage && (
                      <div className="relative w-full max-w-[150px]">
                        <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-lg">
                          <Image
                            src={bestFitImage}
                            alt="最佳匹配效果"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="mt-2 text-center text-sm text-gray-600">
                          最佳匹配效果
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 如果没有最佳匹配图片，显示提示信息 */}
                  {!bestFitImage && (
                    <div className="text-center text-gray-600 mt-4 p-4 bg-gray-100 rounded-lg">
                      <p>最佳匹配图片正在生成中，请稍后查看</p>
                    </div>
                  )}
                </div>

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
                        {/* 显示数据来源 */}
                        <div className="text-sm text-gray-500 mb-4">
                          数据来源:{' '}
                          {jobId ? `API (JobID: ${jobId})` : '本地存储'}
                        </div>

                        {/* 显示整体描述 */}
                        {overallDescription ? (
                          <div className="bg-[#84a59d]/10 p-6 rounded-lg mb-6 shadow-sm">
                            <h3 className="text-xl font-bold font-playfair text-gray-800 mb-4 border-b border-[#84a59d]/20 pb-2">
                              您的整体风格描述
                            </h3>
                            <p className="text-gray-700 font-inter leading-relaxed">
                              {overallDescription}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-6 rounded-lg mb-6 shadow-sm">
                            <h3 className="text-xl font-bold font-playfair text-gray-800 mb-4 border-b border-yellow-200 pb-2">
                              未找到整体描述
                            </h3>
                            <p className="text-gray-700 font-inter leading-relaxed">
                              系统未能找到您的整体描述，请尝试重新上传图片或联系客服。
                            </p>
                          </div>
                        )}

                        {/* 隐藏其他分析点，只在没有整体描述时显示 */}
                        {!overallDescription &&
                          Array.isArray(analysisPoints) &&
                          analysisPoints.map((point, index) => (
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

                        {/* 显示推荐颜色 */}
                        {typingComplete >=
                          (Array.isArray(analysisPoints)
                            ? analysisPoints.length
                            : 0) && (
                          <motion.div
                            initial="initial"
                            animate="animate"
                            variants={textRevealVariants}
                            className="mt-8">
                            <h3 className="text-lg font-bold font-playfair text-gray-800 mb-3">
                              推荐颜色
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {Array.isArray(recommendedColors) &&
                                recommendedColors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col items-center">
                                    <div
                                      className="w-12 h-12 rounded-full shadow-md mb-1"
                                      style={{
                                        backgroundColor: color.hex,
                                      }}></div>
                                    <span className="text-xs text-gray-700">
                                      {color.name}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </motion.div>
                        )}

                        {/* 显示推荐风格 */}
                        {typingComplete >=
                          (Array.isArray(analysisPoints)
                            ? analysisPoints.length
                            : 0) && (
                          <motion.div
                            initial="initial"
                            animate="animate"
                            variants={textRevealVariants}
                            className="mt-4">
                            <h3 className="text-lg font-bold font-playfair text-gray-800 mb-3">
                              推荐风格
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(recommendedStyles) &&
                                recommendedStyles.map((style, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#84a59d]/10 text-[#84a59d] rounded-full text-sm">
                                    {style}
                                  </span>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

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
