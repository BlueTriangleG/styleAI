import { AnalysisPoint } from '@/constants/defaultAnalysisData';

// 提取结构化特征
export const extractFeatures = (parsedData: any): AnalysisPoint[] => {
  const extractedFeatures: AnalysisPoint[] = [];

  try {
    if (parsedData['Structural Features']) {
      // 提取身体特征
      if (parsedData['Structural Features']['Body Features']) {
        const bodyFeatures = parsedData['Structural Features']['Body Features'];
        if (typeof bodyFeatures === 'object' && bodyFeatures !== null) {
          for (const [key, value] of Object.entries(bodyFeatures)) {
            if (typeof value === 'string') {
              extractedFeatures.push({
                title: key,
                content: value,
              });
            } else if (value && typeof value === 'object') {
              for (const [nestedKey, nestedValue] of Object.entries(value)) {
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
        const facialFeatures = parsedData['Structural Features']['Facial Features'];
        if (typeof facialFeatures === 'object' && facialFeatures !== null) {
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
    }
  } catch (e) {
    console.error('处理Structural Features时出错:', e);
  }

  return extractedFeatures;
};

// 提取颜色特征
export const extractColors = (parsedData: any): { name: string; hex: string }[] => {
  const extractedColors: { name: string; hex: string }[] = [];
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

  try {
    if (parsedData['Color Features']) {
      const colorFeatures = parsedData['Color Features'];

      // 添加肤色
      if (colorFeatures['Skin Tone and Visual Characteristics']) {
        extractedColors.push({
          name: 'Skin Tone',
          hex: '#FFE0BD', // 默认肤色
        });
      }

      // 添加发色
      if (colorFeatures['Hair Color and Saturation']) {
        extractedColors.push({
          name: 'Hair Color',
          hex: '#4A4A4A', // 默认发色
        });
      }

      // 添加服装颜色建议
      if (colorFeatures['Clothing Color Optimization Suggestions']) {
        const suggestion = colorFeatures['Clothing Color Optimization Suggestions'];
        const colorRegex = /(black|white|red|green|blue|yellow|purple|pink|orange|brown|gray|navy|burgundy|forest green|charcoal|pastel|neutral)/gi;
        const matches = suggestion.match(colorRegex);

        if (matches) {
          const addedColors = new Set<string>();
          matches.forEach((color: string) => {
            const normalizedColor = color.toLowerCase();
            if (!addedColors.has(normalizedColor) && colorMap[normalizedColor as keyof typeof colorMap]) {
              extractedColors.push({
                name: color,
                hex: colorMap[normalizedColor as keyof typeof colorMap],
              });
              addedColors.add(normalizedColor);
            }
          });
        }
      }
    }
  } catch (e) {
    console.error('处理Color Features时出错:', e);
  }

  return extractedColors;
};

// 提取风格特征
export const extractStyles = (parsedData: any): string[] => {
  const extractedStyles: string[] = [];

  try {
    if (parsedData['Semantic Features'] && parsedData['Semantic Features']['Temperament Features']) {
      const temperamentFeatures = parsedData['Semantic Features']['Temperament Features'];

      // 从整体风格印象中提取风格关键词
      if (temperamentFeatures['Overall Style First Impression']) {
        const impression = temperamentFeatures['Overall Style First Impression'];
        const styleRegex = /(energetic|youthful|playful|artistic|elegant|sophisticated|classic|professional|casual|formal|sporty|creative|dynamic|vibrant)/gi;
        const matches = impression.match(styleRegex);

        if (matches) {
          matches.forEach((style: string) => {
            if (!extractedStyles.includes(style)) {
              extractedStyles.push(style);
            }
          });
        }
      }

      // 从风格优化建议中提取风格关键词
      if (temperamentFeatures['Style Optimization and Temperament Enhancement Suggestions']) {
        const suggestion = temperamentFeatures['Style Optimization and Temperament Enhancement Suggestions'];
        const styleRegex = /(casual|playful|graphic tees|skirts|youthful|artistic|elegant|sophisticated|classic|professional|formal|sporty|creative|dynamic|vibrant)/gi;
        const matches = suggestion.match(styleRegex);

        if (matches) {
          matches.forEach((style: string) => {
            if (!extractedStyles.includes(style)) {
              extractedStyles.push(style);
            }
          });
        }
      }
    }
  } catch (e) {
    console.error('处理Temperament Features时出错:', e);
  }

  return extractedStyles;
};