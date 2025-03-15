# 图片处理模块

这个模块提供了图片格式转换和压缩功能，确保上传的图片不超过 5MB 并转换为 JPEG 格式。

## 功能特点

- 检测图片大小，如果超过 5MB 则进行压缩
- 支持将各种图片格式（PNG、GIF、WebP 等）转换为 JPEG
- 使用 Canvas API 在浏览器中进行图片处理
- 自动调整图片质量和尺寸以达到目标大小
- 支持直接处理 File 对象或 Base64 字符串
- 自动保存处理记录到 localStorage
- 提供下载功能，将处理后的图片保存到本地

## 使用方法

### 处理图片文件

```typescript
import { processImageClient } from '@/lib/imageProcessor';

// 处理 File 对象
async function handleFile(file: File) {
  try {
    // 将图片压缩到5MB以下并转换为JPEG
    const processedImage = await processImageClient(file, 5);

    // 使用处理后的图片
    setImage(processedImage);
  } catch (error) {
    console.error('图片处理失败:', error);
  }
}
```

### 处理 Base64 图片数据

```typescript
import { processImageClient } from '@/lib/imageProcessor';

// 处理 Base64 图片数据
async function handleBase64Image(imageData: string) {
  try {
    // 将图片压缩到5MB以下并转换为JPEG
    const processedImage = await processImageClient(imageData, 5);

    // 使用处理后的图片
    setImage(processedImage);
  } catch (error) {
    console.error('图片处理失败:', error);
  }
}
```

### 下载图片到本地

```typescript
import { downloadImage } from '@/lib/imageProcessor';

// 下载图片
function handleDownload(imageData: string) {
  downloadImage(imageData, 'my_image.jpg');
}
```

### 获取处理记录

```typescript
import { getProcessedImagesInfo } from '@/lib/imageProcessor';

// 获取处理记录
function showHistory() {
  const images = getProcessedImagesInfo();
  console.log(`共处理了 ${images.length} 张图片`);

  images.forEach((img) => {
    console.log(
      `${img.fileName}: ${img.size.toFixed(2)}MB, 时间: ${new Date(
        img.timestamp
      ).toLocaleString()}`
    );
  });
}
```

## 技术实现

- 使用 Canvas API 进行图片绘制和压缩
- 递归调整质量参数直到达到目标大小
- 自动缩小过大的图片尺寸
- 保持图片的原始宽高比
- 对 PNG 等带透明度的图片添加白色背景
- 使用 localStorage 存储处理记录

## 注意事项

1. 此模块仅在客户端（浏览器）环境中工作
2. 依赖于 Canvas API，在某些旧浏览器上可能不支持
3. 大图片处理可能需要较长时间，建议添加加载指示器
4. 压缩过程中会有一定的质量损失
5. 处理记录存储在 localStorage 中，容量有限
6. 下载功能需要用户交互触发，不能在后台自动下载

## 配置

可以在调用 `processImageClient` 函数时调整以下参数：

- 最大图片大小（默认 5MB）
- 内部代码中可调整的参数：
  - 最大图片尺寸（默认 1920x1080）
  - 初始压缩质量（根据原始大小动态调整）
  - 最大压缩尝试次数（默认 10 次）
