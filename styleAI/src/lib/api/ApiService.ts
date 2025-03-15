import { API_SERVER_URL, API_ENDPOINTS, DEFAULT_HEADERS } from './config';

/**
 * API Service for connecting to the Flask backend
 * Provides methods for image processing and other API calls
 */
class ApiService {
  private baseUrl: string;

  /**
   * Constructor
   * @param baseUrl Base URL of the API server
   */
  constructor(baseUrl: string = API_SERVER_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Process an image using the backend API
   * @param imageData Base64 encoded image data
   * @returns Processed image data
   */
  async processImage(imageData: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.IMAGE_PROCESS}`,
        {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ image: imageData }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.processedImage;
      } else {
        throw new Error(result.error || 'Image processing failed');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  /**
   * Prepare an image for download
   * @param imageData Base64 encoded image data
   * @param filename Optional filename
   * @returns File path information
   */
  async prepareDownload(
    imageData: string,
    filename?: string
  ): Promise<{ filePath: string; message: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.IMAGE_DOWNLOAD}`,
        {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({
            image: imageData,
            filename: filename,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          filePath: result.filePath,
          message: result.message,
        };
      } else {
        throw new Error(result.error || 'Download preparation failed');
      }
    } catch (error) {
      console.error('Error preparing download:', error);
      throw error;
    }
  }

  /**
   * Get personalized analysis from the API
   * @param jobId The job ID for the analysis
   * @returns Personalized analysis data
   */
  async getPersonalizedAnalysis(jobId: string): Promise<any> {
    try {
      console.log(`正在获取个性化分析数据，jobId: ${jobId}`);
      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.PERSONALIZED_ANALYSIS}`,
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
      console.log('获取到的个性化分析数据:', result);

      if (result.status === 'success') {
        return result.analysis;
      } else {
        throw new Error(result.error || '获取个性化分析失败');
      }
    } catch (error) {
      console.error('获取个性化分析时出错:', error);
      throw error;
    }
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
   * 创建新的job记录
   * @param uploadedImage 上传的图片数据（可选）
   * @returns 创建的job ID
   */
  async createJob(uploadedImage?: string): Promise<string> {
    try {
      console.log('正在创建新的job记录');

      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadedImage,
        }),
        credentials: 'include', // 包含cookie以便服务器可以验证用户身份
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('创建job记录成功:', result);

      if (result.success) {
        return result.jobId;
      } else {
        throw new Error(result.error || '创建job记录失败');
      }
    } catch (error) {
      console.error('创建job记录时出错:', error);
      throw error;
    }
  }

  /**
   * Check if the API server is available
   * @returns True if the server is available
   */
  async isServerAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.HEALTH}`, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      console.error('API server is not available:', error);
      return false;
    }
  }
}

// Export singleton instance with default configuration
export const apiService = new ApiService();

// Export class for custom instances
export default ApiService;
