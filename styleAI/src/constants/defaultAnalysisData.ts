/**
 * Defines data structure for analysis points
 */
export interface AnalysisPoint {
  title: string;
  content: string;
}

export interface StyleRecommendation {
  title: string;
  description: string;
  examples: string[];
}

export interface AnalysisResults {
  faceShape: string;
  skinTone: string;
  bodyType: string;
  styleMatch: string;
}

/**
 * Default analysis points
 * Provides sample analysis results for demonstration purposes
 */
export const defaultAnalysisPoints: AnalysisPoint[] = [
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

/**
 * Default style recommendations
 * Sample style categories with descriptions for demonstration
 */
export const defaultStyleRecommendations: StyleRecommendation[] = [
  {
    title: 'Business Casual',
    description:
      'Based on your facial features and body type, business casual attire will complement your appearance perfectly. Focus on well-fitted blazers, button-down shirts, and tailored pants.',
    examples: [],
  },
  {
    title: 'Smart Casual',
    description:
      'For a more relaxed yet polished look, smart casual options would work well with your features. Consider premium t-shirts, chinos, and casual jackets.',
    examples: [],
  },
  {
    title: 'Formal Wear',
    description:
      'For special occasions, your features would be enhanced by well-tailored suits in navy or charcoal. Consider slim-fit designs with subtle patterns.',
    examples: [],
  },
  {
    title: 'Sport',
    description:
      'For special occasions, your features would be enhanced by well-tailored suits in navy or charcoal. Consider slim-fit designs with subtle patterns.',
    examples: [],
  },
];

/**
 * Default analysis results
 * Sample user analysis results for demonstration
 */
export const defaultAnalysisResults: AnalysisResults = {
  faceShape: 'Oval',
  skinTone: 'Warm',
  bodyType: 'Athletic',
  styleMatch: 'Business Casual',
};

/**
 * Default color palette
 * Recommended colors that complement the suggested styles
 */
export const defaultColors = [
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Forest Green', hex: '#228B22' },
  { name: 'Charcoal Gray', hex: '#36454F' },
];

/**
 * Default style keywords
 * Primary style descriptors for the user
 */
export const defaultStyles = [
  'Classic',
  'Professional',
  'Elegant',
  'Sophisticated',
];
