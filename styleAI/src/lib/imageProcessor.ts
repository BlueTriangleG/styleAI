'use client';

import ApiService from './api/ApiService';

/**
 * Client-side version of image processing function
 * Uses Canvas API in the browser to compress images and convert to JPEG format
 * @param imageData Base64 encoded image data or File object
 * @param maxSizeMB Maximum file size (MB)
 * @returns Processed Base64 image data
 */
export async function processImageClient(
  imageData: string | File,
  maxSizeMB: number = 5
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let base64Data: string;
      let mimeType: string;
      let sizeInMB: number;

      // Process File object
      if (imageData instanceof File) {
        // Get file MIME type
        mimeType = imageData.type;

        // Calculate file size
        sizeInMB = imageData.size / (1024 * 1024);
        console.log(
          `Original file size: ${sizeInMB.toFixed(2)}MB, type: ${mimeType}`
        );

        // Convert File to Base64
        base64Data = await fileToBase64(imageData);
      } else {
        // Process Base64 string
        const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          throw new Error('Invalid image data format');
        }

        mimeType = matches[1];
        const rawBase64 = matches[2];

        // Calculate image size (in MB)
        sizeInMB = (rawBase64.length * 3) / 4 / (1024 * 1024);
        console.log(
          `Original image size: ${sizeInMB.toFixed(2)}MB, type: ${mimeType}`
        );

        base64Data = imageData;
      }

      // If image is already JPEG and smaller than max size, return directly
      if (sizeInMB <= maxSizeMB && mimeType === 'image/jpeg') {
        // Save to local storage
        saveImageLocally(base64Data, 'original.jpg');
        return resolve(base64Data);
      }

      // Create image element
      const img = new Image();
      img.onload = () => {
        // Create Canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // If image is too large, scale proportionally
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;

        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        if (height > MAX_HEIGHT) {
          width = Math.round(width * (MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image to Canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Cannot create Canvas context'));
        }

        // For PNG or other formats with transparency, fill white background first
        if (mimeType === 'image/png' || mimeType === 'image/webp') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Calculate initial quality
        let quality = 0.9;
        if (sizeInMB > 10) {
          quality = 0.7;
        } else if (sizeInMB > 5) {
          quality = 0.8;
        }

        // Compress image
        compressWithQuality(canvas, quality, maxSizeMB, resolve);
      };

      img.onerror = (error) => {
        console.error('Image loading failed:', error);
        reject(new Error('Image loading failed'));
      };

      img.src = base64Data;
    } catch (error) {
      console.error('Image processing failed:', error);
      reject(error);
    }
  });
}

/**
 * Process image using the server API
 * @param imageData Base64 encoded image data or File object
 * @param maxSizeMB Maximum file size (MB)
 * @returns Processed Base64 image data
 */
export async function processImageServer(
  imageData: string | File,
  maxSizeMB: number = 5
): Promise<string> {
  try {
    // Create API service instance
    const apiService = new ApiService();

    // Check if server is available
    const isServerAvailable = await apiService.isServerAvailable();
    if (!isServerAvailable) {
      console.warn(
        'API server is not available, falling back to client-side processing'
      );
      return processImageClient(imageData, maxSizeMB);
    }

    // Convert File to Base64 if needed
    let base64Data: string;
    if (imageData instanceof File) {
      base64Data = await fileToBase64(imageData);
    } else {
      base64Data = imageData;
    }

    // Process image using API
    const processedImage = await apiService.processImage(base64Data);

    // Save to local storage
    saveImageLocally(processedImage, 'processed_server.jpg');

    return processedImage;
  } catch (error) {
    console.error('Server image processing failed:', error);
    console.warn('Falling back to client-side processing');
    return processImageClient(imageData, maxSizeMB);
  }
}

/**
 * Convert File object to Base64 string
 * @param file File object
 * @returns Base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Recursively compress image until target size is reached
 * @param canvas Canvas element
 * @param quality Initial quality
 * @param maxSizeMB Maximum file size (MB)
 * @param resolve Promise resolve function
 * @param attempt Attempt count
 */
function compressWithQuality(
  canvas: HTMLCanvasElement,
  quality: number,
  maxSizeMB: number,
  resolve: (value: string) => void,
  attempt: number = 1
): void {
  if (attempt > 10) {
    // Prevent infinite recursion
    console.log(`Maximum compression attempts reached, using lowest quality`);
    const finalImage = canvas.toDataURL('image/jpeg', 0.5);
    saveImageLocally(finalImage, `compressed_final.jpg`);
    resolve(finalImage);
    return;
  }

  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  // Check compressed size
  const base64Data = dataUrl.split(',')[1];
  const compressedSize = (base64Data.length * 3) / 4 / (1024 * 1024);
  console.log(
    `Compression attempt #${attempt}: quality=${quality.toFixed(
      2
    )}, size=${compressedSize.toFixed(2)}MB`
  );

  if (compressedSize <= maxSizeMB) {
    console.log(
      `Compression successful: final size=${compressedSize.toFixed(2)}MB`
    );
    // Save to local storage
    saveImageLocally(dataUrl, `compressed_${compressedSize.toFixed(1)}MB.jpg`);
    resolve(dataUrl);
  } else {
    // Continue compressing, reduce quality
    const newQuality = quality * 0.8;
    console.log(`Continue compressing: new quality=${newQuality.toFixed(2)}`);
    compressWithQuality(canvas, newQuality, maxSizeMB, resolve, attempt + 1);
  }
}

/**
 * Save image to local storage
 * @param dataUrl Image Base64 data
 * @param fileName File name
 */
function saveImageLocally(dataUrl: string, fileName: string): void {
  try {
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;

    // Add to document and trigger click
    document.body.appendChild(link);

    // Use localStorage to store recently processed image info
    const imageInfo = {
      timestamp: new Date().toISOString(),
      fileName: fileName,
      size: (dataUrl.length * 3) / 4 / (1024 * 1024),
    };

    // Store image info
    const storedImages = JSON.parse(
      localStorage.getItem('processedImages') || '[]'
    );
    storedImages.push(imageInfo);

    // Only keep the most recent 10 images
    if (storedImages.length > 10) {
      storedImages.shift();
    }

    localStorage.setItem('processedImages', JSON.stringify(storedImages));

    console.log(`Image info saved to localStorage: ${fileName}`);
  } catch (error) {
    console.error('Failed to save image locally:', error);
  }
}

/**
 * Download image to local
 * @param dataUrl Image Base64 data
 * @param fileName File name
 */
export function downloadImage(
  dataUrl: string,
  fileName: string = 'processed_image.jpg'
): void {
  try {
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;

    // Add to document and trigger click
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);

    console.log(`Image downloaded: ${fileName}`);
  } catch (error) {
    console.error('Failed to download image:', error);
  }
}

/**
 * Get recently processed image info
 * @returns Array of image info
 */
export function getProcessedImagesInfo(): Array<{
  timestamp: string;
  fileName: string;
  size: number;
}> {
  try {
    return JSON.parse(localStorage.getItem('processedImages') || '[]');
  } catch (error) {
    console.error('Failed to get processed image info:', error);
    return [];
  }
}

/**
 * Process image using the best available method
 * Tries server-side processing first, falls back to client-side if server is unavailable
 */
export const processImage = async (
  imageData: string | File,
  maxSizeMB: number = 5,
  preferServer: boolean = true
): Promise<string> => {
  if (preferServer) {
    try {
      return await processImageServer(imageData, maxSizeMB);
    } catch (error) {
      console.warn('Server processing failed, falling back to client-side');
      return processImageClient(imageData, maxSizeMB);
    }
  } else {
    return processImageClient(imageData, maxSizeMB);
  }
};
