# Server Actions 使用说明

本目录包含了 Next.js Server Actions，这些函数可以直接从客户端组件调用，无需创建 API 路由。

## 可用的 Server Actions

### 1. Job 相关 Actions (`jobActions.ts`)

#### `createJob`

创建新的 job 记录，可以包含用户上传的图片。

```typescript
import { createJob } from '@/app/actions/jobActions';

// 使用示例
const jobId = await createJob(base64ImageData);
console.log(`创建的job ID: ${jobId}`);
```

#### `getBestFitImage`

获取特定 job 的最佳匹配图片。

```typescript
import { getBestFitImage } from '@/app/actions/jobActions';

// 使用示例
const result = await getBestFitImage(jobId);
if (result.status === 'success') {
  const imageDataUrl = `data:image/jpeg;base64,${result.imageData}`;
  // 使用图片数据...
}
```

#### `generateBestFit`

为特定 job 生成最佳匹配图片。

```typescript
import { generateBestFit } from '@/app/actions/jobActions';

// 使用示例
const result = await generateBestFit(jobId);
if (result.status === 'success') {
  console.log('图片生成成功');
  // 生成成功后，可以使用 getBestFitImage 获取图片
}
```

## 通过 ApiService 使用

我们已经更新了 `ApiService` 类，使其内部使用 Server Actions 而不是直接调用 API。客户端代码可以继续使用 `apiService` 实例，无需修改现有代码。

```typescript
import { apiService } from '@/lib/api/ApiService';

// 创建 job
const jobId = await apiService.createJob(imageData);

// 获取最佳匹配图片
const bestFitResult = await apiService.getBestFitImage(jobId);

// 生成最佳匹配图片
const generateResult = await apiService.generateBestFit(jobId);
```

## 优势

使用 Server Actions 替代 API 路由有以下优势：

1. **更简洁的代码** - 无需创建和维护单独的 API 路由文件
2. **更好的类型安全** - 参数和返回值类型检查更严格
3. **更少的网络请求** - 直接调用服务器函数，无需额外的 HTTP 请求
4. **更好的开发体验** - 客户端和服务器代码可以更紧密地集成

## 注意事项

1. Server Actions 必须在服务器上运行，不会暴露服务器端逻辑给客户端
2. 所有 Server Actions 文件必须以 `'use server';` 指令开头
3. Server Actions 可以从客户端组件中调用，但不能在客户端运行
