'use client';

/**
 * 客户端版本的图片处理函数
 * 使用Canvas API在浏览器中压缩图片并转换为JPEG格式
 * @param imageData Base64编码的图片数据或File对象
 * @param maxSizeMB 最大文件大小(MB)
 * @returns 处理后的Base64图片数据
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

      // 处理File对象
      if (imageData instanceof File) {
        // 获取文件MIME类型
        mimeType = imageData.type;

        // 计算文件大小
        sizeInMB = imageData.size / (1024 * 1024);
        console.log(
          `原始文件大小: ${sizeInMB.toFixed(2)}MB, 类型: ${mimeType}`
        );

        // 将File转换为Base64
        base64Data = await fileToBase64(imageData);
      } else {
        // 处理Base64字符串
        const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          throw new Error('无效的图片数据格式');
        }

        mimeType = matches[1];
        const rawBase64 = matches[2];

        // 计算图片大小（以MB为单位）
        sizeInMB = (rawBase64.length * 3) / 4 / (1024 * 1024);
        console.log(
          `原始图片大小: ${sizeInMB.toFixed(2)}MB, 类型: ${mimeType}`
        );

        base64Data = imageData;
      }

      // 如果图片已经是JPEG格式且小于最大大小，直接返回
      if (sizeInMB <= maxSizeMB && mimeType === 'image/jpeg') {
        // 保存到本地
        saveImageLocally(base64Data, 'original.jpg');
        return resolve(base64Data);
      }

      // 创建图片元素
      const img = new Image();
      img.onload = () => {
        // 创建Canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 如果图片太大，按比例缩小
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

        // 绘制图片到Canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('无法创建Canvas上下文'));
        }

        // 如果是PNG等带透明度的格式，先填充白色背景
        if (mimeType === 'image/png' || mimeType === 'image/webp') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 计算初始质量
        let quality = 0.9;
        if (sizeInMB > 10) {
          quality = 0.7;
        } else if (sizeInMB > 5) {
          quality = 0.8;
        }

        // 压缩图片
        compressWithQuality(canvas, quality, maxSizeMB, resolve);
      };

      img.onerror = (error) => {
        console.error('图片加载失败:', error);
        reject(new Error('图片加载失败'));
      };

      img.src = base64Data;
    } catch (error) {
      console.error('图片处理失败:', error);
      reject(error);
    }
  });
}

/**
 * 将File对象转换为Base64字符串
 * @param file 文件对象
 * @returns Base64字符串
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
 * 递归压缩图片直到达到目标大小
 * @param canvas Canvas元素
 * @param quality 初始质量
 * @param maxSizeMB 最大文件大小(MB)
 * @param resolve Promise解析函数
 * @param attempt 尝试次数
 */
function compressWithQuality(
  canvas: HTMLCanvasElement,
  quality: number,
  maxSizeMB: number,
  resolve: (value: string) => void,
  attempt: number = 1
): void {
  if (attempt > 10) {
    // 防止无限递归
    console.log(`达到最大压缩尝试次数，使用最低质量`);
    const finalImage = canvas.toDataURL('image/jpeg', 0.5);
    saveImageLocally(finalImage, `compressed_final.jpg`);
    resolve(finalImage);
    return;
  }

  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  // 检查压缩后的大小
  const base64Data = dataUrl.split(',')[1];
  const compressedSize = (base64Data.length * 3) / 4 / (1024 * 1024);
  console.log(
    `压缩尝试 #${attempt}: 质量=${quality.toFixed(
      2
    )}, 大小=${compressedSize.toFixed(2)}MB`
  );

  if (compressedSize <= maxSizeMB) {
    console.log(`压缩成功: 最终大小=${compressedSize.toFixed(2)}MB`);
    // 保存到本地
    saveImageLocally(dataUrl, `compressed_${compressedSize.toFixed(1)}MB.jpg`);
    resolve(dataUrl);
  } else {
    // 继续压缩，降低质量
    const newQuality = quality * 0.8;
    console.log(`继续压缩: 新质量=${newQuality.toFixed(2)}`);
    compressWithQuality(canvas, newQuality, maxSizeMB, resolve, attempt + 1);
  }
}

/**
 * 保存图片到本地
 * @param dataUrl 图片的Base64数据
 * @param fileName 文件名
 */
function saveImageLocally(dataUrl: string, fileName: string): void {
  try {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;

    // 添加到文档中并触发点击
    document.body.appendChild(link);

    // 使用localStorage存储最近处理的图片信息
    const imageInfo = {
      timestamp: new Date().toISOString(),
      fileName: fileName,
      size: (dataUrl.length * 3) / 4 / (1024 * 1024),
    };

    // 存储图片信息
    const storedImages = JSON.parse(
      localStorage.getItem('processedImages') || '[]'
    );
    storedImages.push(imageInfo);

    // 只保留最近10张图片的信息
    if (storedImages.length > 10) {
      storedImages.shift();
    }

    localStorage.setItem('processedImages', JSON.stringify(storedImages));

    console.log(`图片信息已保存到localStorage: ${fileName}`);
  } catch (error) {
    console.error('保存图片到本地失败:', error);
  }
}

/**
 * 下载图片到本地
 * @param dataUrl 图片的Base64数据
 * @param fileName 文件名
 */
export function downloadImage(
  dataUrl: string,
  fileName: string = 'processed_image.jpg'
): void {
  try {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;

    // 添加到文档中并触发点击
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);

    console.log(`图片已下载: ${fileName}`);
  } catch (error) {
    console.error('下载图片失败:', error);
  }
}

/**
 * 获取最近处理的图片信息
 * @returns 图片信息数组
 */
export function getProcessedImagesInfo(): Array<{
  timestamp: string;
  fileName: string;
  size: number;
}> {
  try {
    return JSON.parse(localStorage.getItem('processedImages') || '[]');
  } catch (error) {
    console.error('获取处理图片信息失败:', error);
    return [];
  }
}

/**
 * 为了保持API兼容性，提供一个processImage函数
 * 在客户端环境中，这只是processImageClient的别名
 */
export const processImage = processImageClient;
