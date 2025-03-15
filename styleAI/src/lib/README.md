# Image Processing Module

This module provides image format conversion and compression functionality, ensuring uploaded images do not exceed 5MB and are converted to JPEG format.

## Features

- Detects image size and compresses if it exceeds 5MB
- Supports converting various image formats (PNG, GIF, WebP, etc.) to JPEG
- Uses Canvas API for image processing in the browser
- Automatically adjusts image quality and dimensions to achieve target size
- Supports direct processing of File objects or Base64 strings
- Automatically saves processing records to localStorage
- Provides download functionality to save processed images locally

## Usage

### Processing Image Files

```typescript
import { processImageClient } from '@/lib/imageProcessor';

// Process File object
async function handleFile(file: File) {
  try {
    // Compress image to under 5MB and convert to JPEG
    const processedImage = await processImageClient(file, 5);

    // Use the processed image
    setImage(processedImage);
  } catch (error) {
    console.error('Image processing failed:', error);
  }
}
```

### Processing Base64 Image Data

```typescript
import { processImageClient } from '@/lib/imageProcessor';

// Process Base64 image data
async function handleBase64Image(imageData: string) {
  try {
    // Compress image to under 5MB and convert to JPEG
    const processedImage = await processImageClient(imageData, 5);

    // Use the processed image
    setImage(processedImage);
  } catch (error) {
    console.error('Image processing failed:', error);
  }
}
```

### Downloading Images

```typescript
import { downloadImage } from '@/lib/imageProcessor';

// Download image
function handleDownload(imageData: string) {
  downloadImage(imageData, 'my_image.jpg');
}
```

### Getting Processing Records

```typescript
import { getProcessedImagesInfo } from '@/lib/imageProcessor';

// Get processing records
function showHistory() {
  const images = getProcessedImagesInfo();
  console.log(`Processed ${images.length} images`);

  images.forEach((img) => {
    console.log(
      `${img.fileName}: ${img.size.toFixed(2)}MB, Time: ${new Date(
        img.timestamp
      ).toLocaleString()}`
    );
  });
}
```

## Technical Implementation

- Uses Canvas API for image drawing and compression
- Recursively adjusts quality parameters until target size is reached
- Automatically resizes oversized images
- Maintains original aspect ratio
- Adds white background to PNG and other formats with transparency
- Uses localStorage to store processing records

## Notes

1. This module only works in client-side (browser) environments
2. Depends on Canvas API, which may not be supported in some older browsers
3. Processing large images may take time, consider adding a loading indicator
4. Compression process will result in some quality loss
5. Processing records are stored in localStorage, which has limited capacity
6. Download functionality requires user interaction to trigger, cannot download automatically in the background

## Configuration

You can adjust the following parameters when calling the `processImageClient` function:

- Maximum image size (default 5MB)
- Internally adjustable parameters:
  - Maximum image dimensions (default 1920x1080)
  - Initial compression quality (dynamically adjusted based on original size)
  - Maximum compression attempts (default 10 attempts)
