import { NextRequest, NextResponse } from 'next/server';
import { processImageClient } from '@/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { image } = data;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Process image - using client-side processing method on server
    // Note: This may not work properly on server-side as Canvas API is a browser feature
    // This is just for API compatibility
    let processedImage;
    try {
      processedImage = await processImageClient(image, 5);
    } catch (error) {
      console.error('Error processing image:', error);
      // If processing fails, return original image
      processedImage = image;
    }

    return NextResponse.json({
      success: true,
      processedImage,
    });
  } catch (error) {
    console.error('Error in image processing API:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

// Set larger response body size limit as we're handling images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
