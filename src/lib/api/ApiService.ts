import { API_ENDPOINTS, DEFAULT_HEADERS } from './constants';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get wear suit pictures from the API
   * @param jobId The job ID for the wear suit pictures
   * @returns Wear suit pictures data
   */
  async getWearSuitPictures(jobId: string): Promise<any> {
    try {
      console.log(`正在获取穿着建议图片，jobId: ${jobId}`);
      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.WEAR_SUIT_PICTURES}`,
        {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ jobId }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('获取到的穿着建议图片:', result);

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.error || '获取穿着建议图片失败');
      }
    } catch (error) {
      console.error('获取穿着建议图片时出错:', error);
      throw error;
    }
  }

  /**
   * Get best fit image from the API
   * @param jobId The job ID for the best fit image
   * @returns Best fit image data in base64 format
   */
  async getBestFitImage(jobId: string): Promise<any> {
    try {
      console.log(`正在获取最佳匹配图片，jobId: ${jobId}`);
      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.BEST_FIT_IMAGE}`,
        {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ jobId }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('获取到的最佳匹配图片:', result);

      if (result.status === 'success') {
        return result;
      } else {
        throw new Error(result.error || '获取最佳匹配图片失败');
      }
    } catch (error) {
      console.error('获取最佳匹配图片时出错:', error);
      throw error;
    }
  }

  /**
   * Check if the API server is available
   * @returns True if the server is available
   */
  async isServerAvailable(): Promise<boolean> {
    // ... existing code ...
  }
}

export default ApiService;
