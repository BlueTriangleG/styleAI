/**
 * Sample data for algorithm gallery
 *
 * This file contains example algorithm data to display in the gallery.
 * In a production environment, this data would likely come from an API.
 */

import { Algorithm } from './AlgorithmGallery';

// For the base path handling
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const sampleAlgorithms: Algorithm[] = [
  {
    id: 'getBestFitCloth',
    title: 'Generate your best fit cloth',
    description:
      'AI-powered clothing recommendations based on your style and body type',
    imageUrl: `${basePath}/gallery/outfit1.png`,
  },
  {
    id: 'hair-style',
    title: 'Hair Style',
    description:
      'Find the perfect hairstyle that matches your face shape and personality',
    imageUrl: `${basePath}/gallery/outfit2.png`,
  },
  {
    id: 'Self-portrait',
    title: 'Self-portrait',
    description:
      'Create artistic self-portraits in various styles and aesthetics',
    imageUrl: `${basePath}/gallery/outfit3.png`,
  },
  {
    id: 'future',
    title: 'More features coming soon',
    description:
      "We're constantly developing new style algorithms to enhance your experience",
    imageUrl: `${basePath}/gallery/outfit4.png`,
  },
];

// Fallback image paths (using local placeholder images)
export const fallbackImages = [
  `${basePath}/gallery/outfit1.png`,
  `${basePath}/gallery/outfit2.png`,
  `${basePath}/gallery/outfit3.png`,
  `${basePath}/gallery/outfit4.png`,
];
