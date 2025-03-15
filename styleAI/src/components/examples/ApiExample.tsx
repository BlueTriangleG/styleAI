'use client';

import { useState, useEffect } from 'react';
import ApiService from '@/lib/api/ApiService';

// Create an instance of the API service
const apiService = new ApiService();

export default function ApiExample() {
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const isAvailable = await apiService.isServerAvailable();
        setServerStatus(isAvailable);
      } catch (error) {
        console.error('Error checking server status:', error);
        setServerStatus(false);
      }
    };

    checkServerStatus();
  }, []);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Failed to read file');
    }
  };

  // Process image
  const handleProcessImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setError(null);

    try {
      const processed = await apiService.processImage(image);
      setProcessedImage(processed);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download processed image
  const handleDownload = async () => {
    if (!processedImage) return;

    try {
      // Client-side download using anchor element
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed_image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Service Example</h1>

      {/* Server Status */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Server Status</h2>
        {serverStatus === null ? (
          <p>Checking server status...</p>
        ) : serverStatus ? (
          <p className="text-green-600">Server is available</p>
        ) : (
          <p className="text-red-600">
            Server is not available. Please make sure the Flask API server is
            running at http://127.0.0.1:5001
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Upload Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />

        {image && (
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Original Image</h3>
            <img
              src={image}
              alt="Original"
              className="max-w-xs max-h-64 object-contain border"
            />
          </div>
        )}

        <button
          onClick={handleProcessImage}
          disabled={!image || isProcessing || !serverStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed">
          {isProcessing ? 'Processing...' : 'Process Image'}
        </button>
      </div>

      {/* Processed Image */}
      {processedImage && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Processed Image</h2>
          <img
            src={processedImage}
            alt="Processed"
            className="max-w-xs max-h-64 object-contain border mb-4"
          />
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-500 text-white rounded">
            Download
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
