'use server';

import { createJob as dbCreateJob, getJobById } from '@/lib/models/job';
import { v4 as uuidv4 } from 'uuid';
import { currentUser } from '@clerk/nextjs/server';

/**
 * 创建新的job记录
 * @param uploadedImage 上传的图片数据（可选）
 * @returns 创建的job ID
 */
export async function createJob(
  uploadedImage?: string,
  dbUserId?: string
): Promise<string> {
  try {
    let userId: string;

    // 尝试获取Clerk用户
    const user = await currentUser();

    if (user) {
      console.log('使用Clerk用户ID:', user.id);
      // 在真实环境中，你需要在这里获取数据库用户ID
      // 为了简化，我们这里直接使用Clerk用户ID
      userId = user.id;
    } else {
      console.log('未找到用户，使用临时用户ID');
      userId = 'temp-' + uuidv4();
    }

    console.log(`使用的用户ID: ${userId}`);

    // 处理上传的图像
    let uploadedImageBuffer: Buffer | undefined;

    // 如果请求中包含图片数据（Base64格式），则转换为Buffer
    if (uploadedImage) {
      // 移除Base64前缀（如果有）
      const base64Data = uploadedImage.replace(/^data:image\/\w+;base64,/, '');
      uploadedImageBuffer = Buffer.from(base64Data, 'base64');
    }

    // 创建job记录
    const job = await dbCreateJob(userId, uploadedImageBuffer);

    console.log(`成功创建job记录，ID: ${job.id}`);
    return job.id;
  } catch (error) {
    console.error('创建job记录失败:', error);
    throw new Error(`创建job记录失败: ${(error as Error).message}`);
  }
}

/**
 * 获取job的best_fit图片数据
 * @param jobId Job ID
 * @returns 图片数据和状态
 */
export async function getBestFitImage(jobId: string): Promise<{
  status: 'success' | 'error';
  jobId: string;
  imageData?: string;
  error?: string;
}> {
  try {
    if (!jobId) {
      return {
        status: 'error',
        jobId: '',
        error: '缺少必要参数: jobId',
      };
    }

    console.log(`正在获取job的best_fit图片数据，jobId: ${jobId}`);

    // 从数据库获取job记录
    const job = await getJobById(jobId);

    if (!job) {
      console.log(`未找到job记录，jobId: ${jobId}`);
      return {
        status: 'error',
        jobId,
        error: `未找到job记录: ${jobId}`,
      };
    }

    // 检查是否有best_fit图片数据
    if (!job.best_fit) {
      console.log(`Job记录中没有best_fit图片数据，jobId: ${jobId}`);
      return {
        status: 'error',
        jobId,
        error: '没有best_fit图片数据',
      };
    }

    // 将Buffer转换为Base64字符串
    const imageData = Buffer.from(job.best_fit).toString('base64');

    // 返回成功响应
    return {
      status: 'success',
      jobId,
      imageData,
    };
  } catch (error) {
    console.error('获取job的best_fit图片数据失败:', error);
    return {
      status: 'error',
      jobId,
      error: `获取best_fit图片数据失败: ${(error as Error).message}`,
    };
  }
}

/**
 * 获取job的target_description数据
 * @param jobId Job ID
 * @returns job描述数据和状态
 */
export async function getJobDescription(jobId: string): Promise<{
  status: 'success' | 'error';
  jobId: string;
  description?: any;
  error?: string;
}> {
  try {
    if (!jobId) {
      return {
        status: 'error',
        jobId: '',
        error: '缺少必要参数: jobId',
      };
    }

    console.log(`正在获取job的target_description数据，jobId: ${jobId}`);

    // 从数据库获取job记录
    const job = await getJobById(jobId);

    if (!job) {
      console.log(`未找到job记录，jobId: ${jobId}`);
      return {
        status: 'error',
        jobId,
        error: `未找到job记录: ${jobId}`,
      };
    }

    // 检查是否有target_description数据
    if (!job.target_description) {
      console.log(`Job记录中没有target_description数据，jobId: ${jobId}`);
      return {
        status: 'error',
        jobId,
        error: '没有target_description数据',
      };
    }

    let parsedDescription;

    // 尝试解析JSON数据
    try {
      // 如果数据以Buffer或字符串形式存储
      if (Buffer.isBuffer(job.target_description)) {
        parsedDescription = JSON.parse(job.target_description.toString('utf8'));
      } else {
        // 如果已经是字符串或对象
        parsedDescription =
          typeof job.target_description === 'string'
            ? JSON.parse(job.target_description)
            : job.target_description;
      }
    } catch (parseError) {
      console.error('解析target_description JSON数据失败:', parseError);
      return {
        status: 'error',
        jobId,
        error: `解析description数据失败: ${(parseError as Error).message}`,
      };
    }

    // 返回成功响应
    return {
      status: 'success',
      jobId,
      description: parsedDescription,
    };
  } catch (error) {
    console.error('获取job的target_description数据失败:', error);
    return {
      status: 'error',
      jobId,
      error: `获取description数据失败: ${(error as Error).message}`,
    };
  }
}
