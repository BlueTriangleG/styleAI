'use server';

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import util from 'util';
import os from 'os';

const execPromise = util.promisify(exec);
const writeFilePromise = util.promisify(fs.writeFile);
const unlinkPromise = util.promisify(fs.unlink);
const statPromise = util.promisify(fs.stat);

// 最大文件大小 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * 检查ffmpeg是否可用
 * @returns 是否可用
 */
async function isFFmpegAvailable(): Promise<boolean> {
  try {
    await execPromise('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('ffmpeg不可用:', error);
    return false;
  }
}

/**
 * 检查并处理图片，确保其大小不超过5MB
 * @param imageBase64 Base64编码的图片数据
 * @returns 处理后的Base64图片数据
 */
export async function processImage(
  imageBase64: string
): Promise<{ success: boolean; data: string; message: string }> {
  try {
    // 检查ffmpeg是否可用
    const ffmpegAvailable = await isFFmpegAvailable();
    if (!ffmpegAvailable) {
      console.warn('ffmpeg不可用，将跳过图片处理');
      return {
        success: true,
        data: imageBase64,
        message: 'ffmpeg不可用，已跳过处理',
      };
    }

    // 从Base64中提取MIME类型和数据
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return {
        success: false,
        data: '',
        message: '无效的图片格式',
      };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 检查文件大小
    const fileSize = buffer.length;

    // 如果文件小于5MB，直接返回原图
    if (fileSize <= MAX_FILE_SIZE) {
      return {
        success: true,
        data: imageBase64,
        message: '图片大小已符合要求',
      };
    }

    // 创建临时文件
    const tempDir = os.tmpdir();
    const inputFilename = path.join(
      tempDir,
      `${uuidv4()}-input.${getExtensionFromMime(mimeType)}`
    );
    const outputFilename = path.join(tempDir, `${uuidv4()}-output.jpg`);

    // 写入临时文件
    await writeFilePromise(inputFilename, buffer);

    // 计算目标质量，根据原始大小动态调整
    const targetQuality = calculateTargetQuality(fileSize);

    // 使用ffmpeg转换图片
    await execPromise(
      `ffmpeg -i ${inputFilename} -q:v ${targetQuality} ${outputFilename}`
    );

    // 检查输出文件大小
    const outputStats = await statPromise(outputFilename);

    // 如果输出文件仍然太大，进一步降低质量
    if (outputStats.size > MAX_FILE_SIZE) {
      // 删除第一次生成的文件
      await unlinkPromise(outputFilename);

      // 使用更低的质量重新生成
      const lowerQuality = Math.max(1, targetQuality - 10);
      await execPromise(
        `ffmpeg -i ${inputFilename} -q:v ${lowerQuality} ${outputFilename}`
      );
    }

    // 读取处理后的文件
    const processedImage = fs.readFileSync(outputFilename);
    const processedBase64 = `data:image/jpeg;base64,${processedImage.toString(
      'base64'
    )}`;

    // 清理临时文件
    await unlinkPromise(inputFilename);
    await unlinkPromise(outputFilename);

    return {
      success: true,
      data: processedBase64,
      message: '图片已成功压缩',
    };
  } catch (error) {
    console.error('图片处理错误:', error);
    return {
      success: false,
      data: '',
      message: `图片处理失败: ${
        error instanceof Error ? error.message : '未知错误'
      }`,
    };
  }
}

/**
 * 根据文件大小计算目标质量
 * @param fileSize 原始文件大小（字节）
 * @returns ffmpeg质量参数 (1-31，1为最高质量)
 */
function calculateTargetQuality(fileSize: number): number {
  // 根据原始文件大小动态调整质量
  // 文件越大，质量值越高（质量越低）
  const ratio = fileSize / MAX_FILE_SIZE;

  if (ratio > 5) return 25;
  if (ratio > 3) return 20;
  if (ratio > 2) return 15;
  return 10;
}

/**
 * 从MIME类型获取文件扩展名
 * @param mimeType MIME类型
 * @returns 文件扩展名
 */
function getExtensionFromMime(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
  };

  return mimeMap[mimeType] || 'jpg';
}
