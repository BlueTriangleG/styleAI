import { useState, useEffect } from 'react';
import { getBestFitImage } from '@/app/actions/jobActions';
import { apiService } from '@/lib/api';

/**
 * Hook for fetching the best fit image for a user's style
 * Follows a flow of: try database -> if fails, call API -> if succeeds, retry database
 * @returns Object containing bestFitImage, loading state and error information
 */
interface UseBestFitImageReturn {
  bestFitImage: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useBestFitImage = (): UseBestFitImageReturn => {
  const [bestFitImage, setBestFitImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 安全的状态更新函数，避免重复设置相同值
  const safeSetError = (newError: string | null) => {
    setError(prev => prev !== newError ? newError : prev);
  };

  useEffect(() => {
    const fetchImage = async () => {
      if (typeof window === 'undefined') return;

      try {
        console.log('Getting best fit image data');

        // Get jobId from storage
        const jobIdFromStorage = sessionStorage.getItem('currentJobId');
        if (!jobIdFromStorage) {
          console.log('No jobId found, cannot fetch best fit image');
          safeSetError('No jobId found, cannot fetch best fit image');
          setIsLoading(false);
          return;
        }

        // Get image following the required flow
        await fetchBestFitImage(jobIdFromStorage);
      } catch (error) {
        console.error('Error getting best fit image:', error);
        safeSetError('Failed to get best fit image, please try again');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, []);

  /**
   * Fetches the best fit image following this flow:
   * 1. Try database first
   * 2. If database fails, call API service
   * 3. If API succeeds, retry database
   * 4. Return appropriate result/error
   * @param jobId The job ID to fetch image for
   */
  const fetchBestFitImage = async (jobId: string) => {
    try {
      console.log(`Fetching best fit image, jobId: ${jobId}`);

      // Step 1: First try to get from database
      let bestFitResult = await getBestFitImage(jobId);

      // If database retrieval successful, process and return
      if (bestFitResult.status === 'success' && bestFitResult.imageData) {
        processSuccessfulResult(bestFitResult);
        return;
      }

      console.log('Database fetch failed, trying API service');

      // Step 2: If database fetch fails, try API service
      try {
        const apiResult = await apiService.getWearSuitPictures(jobId);
        console.log('API service result:', apiResult);

        if (apiResult) {
          console.log('API call successful, retrying database fetch');

          // Step 3: If API call succeeds, retry database
          bestFitResult = await getBestFitImage(jobId);
          console.log('Second database fetch result:', bestFitResult);
          if (bestFitResult.status === 'success' && bestFitResult.imageData) {
            processSuccessfulResult(bestFitResult);
          } else {
            console.log('Second database fetch failed:', bestFitResult.error);
            safeSetError(
              bestFitResult.error ||
                'Failed to get best fit image after generation'
            );
          }
        } else {
          safeSetError('API service did not return a valid result');
        }
      } catch (apiError) {
        // Step 4: Handle API service error
        console.error('API service error:', apiError);
        safeSetError('Failed to generate best fit image from API service');
      }
    } catch (error) {
      console.error('Error in fetchBestFitImage flow:', error);
      safeSetError('Failed to get best fit image');
      throw error;
    }
  };

  /**
   * Process successful image result data
   * @param bestFitResult The successful result with image data
   */
  const processSuccessfulResult = (bestFitResult: {
    status: 'success' | 'error';
    jobId: string;
    imageData?: string;
    error?: string;
  }) => {
    if (!bestFitResult.imageData) {
      console.error('processSuccessfulResult called with no imageData');
      return;
    }

    // Convert Base64 image data to Data URL
    const imageDataUrl = `data:image/jpeg;base64,${bestFitResult.imageData}`;
    // 只有当图片真的不同时才更新状态
    setBestFitImage(prev => prev !== imageDataUrl ? imageDataUrl : prev);
    console.log('Successfully set best fit image');

    // Store in sessionStorage for later use
    sessionStorage.setItem('bestFitImage', imageDataUrl);
  };

  return {
    bestFitImage,
    isLoading,
    error,
  };
};
