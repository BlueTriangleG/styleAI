# StyleAI API Service

This module provides a client-side API service for connecting to the StyleAI Flask API server.

## Features

- Image processing via server-side API
- Automatic fallback to client-side processing if server is unavailable
- Health check to verify server availability
- Download functionality for processed images

## Usage

### Basic Usage

```typescript
import { apiService } from '@/lib/api';

// Process an image
async function processImage(imageData: string) {
  try {
    const processedImage = await apiService.processImage(imageData);
    // Use the processed image
    setImage(processedImage);
  } catch (error) {
    console.error('Image processing failed:', error);
  }
}
```

### Custom API Service Instance

```typescript
import ApiService from '@/lib/api/ApiService';

// Create a custom instance with a different base URL
const customApiService = new ApiService('https://api.example.com');

// Check if server is available
async function checkServer() {
  const isAvailable = await customApiService.isServerAvailable();
  console.log(`Server is ${isAvailable ? 'available' : 'not available'}`);
}
```

### Integration with Image Processor

The API service is integrated with the existing image processor module. You can use the `processImage` function which will automatically try server-side processing first and fall back to client-side if needed:

```typescript
import { processImage } from '@/lib/imageProcessor';

// Process an image (tries server first, falls back to client)
async function handleImage(file: File) {
  const processedImage = await processImage(file, 5, true);
  // Use the processed image
}
```

## Configuration

The API service uses the following environment variables:

- `NEXT_PUBLIC_API_SERVER_URL`: The base URL of the API server (default: `http://127.0.0.1:5001`)

You can set these variables in your `.env.local` file:

```
NEXT_PUBLIC_API_SERVER_URL=http://127.0.0.1:5001
```

## API Endpoints

The API service connects to the following endpoints:

- `GET /health`: Health check endpoint
- `POST /api/image/process`: Process an image
- `POST /api/image/download`: Prepare an image for download

## Example Component

An example component is provided at `/src/components/examples/ApiExample.tsx` which demonstrates how to use the API service. You can view this example at `/api-example` in your application.
