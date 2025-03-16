'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/home/header';
import { motion } from 'framer-motion';
import LiquidChrome from '@/components/background/LiquidChrome';
import {
  processImageClient,
  downloadImage,
  getProcessedImagesInfo,
} from '@/lib/imageProcessor';

export default function Step1() {
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoDivRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [processedImages, setProcessedImages] = useState<
    Array<{ timestamp: string; fileName: string; size: number }>
  >([]);
  const [showProcessedImages, setShowProcessedImages] = useState(false);

  // Check if device has camera
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          // Just check if getUserMedia is supported
          await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCamera(true);

          // Get all available video input devices
          if (navigator.mediaDevices.enumerateDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
              (device) => device.kind === 'videoinput'
            );
            setCameras(videoDevices);

            // If camera exists, select the first one by default
            if (videoDevices.length > 0) {
              setSelectedCamera(videoDevices[0].deviceId);
            }
          }
        }
      } catch (err) {
        console.log('Camera not available or permission denied');
        setHasCamera(false);
      }
    };

    checkCamera();
  }, []);

  // Load processed image information
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const images = getProcessedImagesInfo();
      setProcessedImages(images);
    }
  }, []);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selection event triggered', e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    setIsUploading(true);

    try {
      // Process File object directly
      console.log(
        `Processing file: ${file.name}, type: ${file.type}, size: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );

      // Use client-side compression method to process File object directly
      const processedImage = await processImageClient(file, 5);

      // Update processed image list
      const images = getProcessedImagesInfo();
      setProcessedImages(images);

      setImage(processedImage);
      setIsUploading(false);

      // Clear input value to ensure the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setIsUploading(false);

      // Also clear input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    console.log('Triggering file upload click event');
    // Prevent multiple triggers
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Switch camera
  const switchCamera = async () => {
    // Toggle between front and back cameras
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // If there are multiple cameras, try to find the corresponding device
    if (cameras.length > 1) {
      // Find the next camera
      const currentIndex = cameras.findIndex(
        (camera) => camera.deviceId === selectedCamera
      );
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCamera(cameras[nextIndex].deviceId);
    }

    // Restart camera
    await startCamera(newFacingMode);
  };

  // Select specific camera
  const handleCameraChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const deviceId = e.target.value;
    setSelectedCamera(deviceId);
    await startCamera(facingMode, deviceId);
  };

  // Start camera
  const startCamera = async (
    facingMode: 'user' | 'environment' = 'user',
    deviceId?: string
  ) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Build video constraints
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: 3 / 4,
      };

      // If device ID is specified, use it with priority
      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        // Otherwise use facingMode
        videoConstraints.facingMode = facingMode;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      return false;
    }
  };

  // Open camera
  const handleCameraClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    setIsCameraOpen(true);
    const success = await startCamera(facingMode, selectedCamera || undefined);
    if (!success) {
      setIsCameraOpen(false);
    }
  };

  // Take photo
  const handleTakePhoto = async () => {
    if (videoRef.current && canvasRef.current && videoDivRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const videoDiv = videoDivRef.current;

      // Get video container dimensions
      const containerWidth = videoDiv.clientWidth;
      const containerHeight = videoDiv.clientHeight;

      // Set canvas dimensions to container dimensions, maintaining rectangular ratio
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Calculate video position and size in container
      const videoRatio = video.videoWidth / video.videoHeight;
      const containerRatio = containerWidth / containerHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (videoRatio > containerRatio) {
        // Video is wider than container, use height as reference
        drawHeight = containerHeight;
        drawWidth = video.videoWidth * (containerHeight / video.videoHeight);
        offsetX = (containerWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Video is taller than container, use width as reference
        drawWidth = containerWidth;
        drawHeight = video.videoHeight * (containerWidth / video.videoWidth);
        offsetX = 0;
        offsetY = (containerHeight - drawHeight) / 2;
      }

      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        // Clear canvas first
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw video frame
        context.drawImage(
          video,
          0,
          0,
          video.videoWidth,
          video.videoHeight,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight
        );

        // Convert to data URL
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);

        try {
          // Use new image processing feature to process photo
          const processedImage = await processImageClient(photoDataUrl, 5);

          // Update processed image list
          const images = getProcessedImagesInfo();
          setProcessedImages(images);

          setImage(processedImage);
        } catch (error) {
          console.error('Error processing photo:', error);
          setImage(photoDataUrl); // If processing fails, use original image
        }

        // Close camera
        handleCloseCamera();
      }
    }
  };

  // Close camera
  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle next button click
  const handleNextClick = () => {
    if (image) {
      // Store the image in session storage or state management
      if (typeof window !== 'undefined') {
        // Only access sessionStorage in browser environment
        try {
          // 确保清除之前的数据
          sessionStorage.removeItem('userImage');
          // 存储新的图像数据
          sessionStorage.setItem('userImage', image);
          console.log('图像已成功存储到sessionStorage');
        } catch (error) {
          console.error('存储图像到sessionStorage时出错:', error);
        }
      }

      // Start transition animation
      setIsTransitioning(true);

      // 延长动画时间，确保有足够时间进行过渡
      setTimeout(() => {
        // 使用replace而不是push，避免浏览器历史记录问题
        router.replace('/personalized-recommendation/loading');
      }, 800); // 增加到800ms，给动画更多时间
    } else {
      // 如果没有图像，显示提示
      alert('请先上传或拍摄一张照片');
    }
  };

  // Download current image
  const handleDownloadImage = () => {
    if (image) {
      downloadImage(image, `styleAI_image_${new Date().getTime()}.jpg`);
    }
  };

  // Show/hide processed image list
  const toggleProcessedImages = () => {
    setShowProcessedImages(!showProcessedImages);
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        when: 'afterChildren',
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <Header />
      <motion.div
        className="min-h-screen pt-20 relative"
        initial="initial"
        animate={isTransitioning ? 'exit' : 'animate'}
        variants={pageVariants}
        transition={{ duration: 0.5 }}>
        {/* 流动背景 */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <LiquidChrome
            baseColor={[0.9, 0.9, 0.9]}
            speed={0.2}
            amplitude={0.5}
            frequencyX={3}
            frequencyY={2}
            interactive={true}
          />
          {/* 半透明覆盖层，降低透明度以允许互动 */}
          <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
        </div>

        {/* 内容区域 */}
        <div className="container mx-auto px-4 py-6 relative z-10">
          <motion.h1
            className="text-4xl font-bold mb-10 text-left font-playfair"
            variants={itemVariants}>
            Upload Your Photo
          </motion.h1>

          <div
            className="flex flex-col md:flex-row gap-8"
            style={{ minHeight: 'calc(100vh - 200px)' }}>
            {/* Left side - Upload area */}
            <motion.div
              className="w-full md:w-1/2 bg-white/60 backdrop-blur-xs rounded-lg p-4 flex flex-col items-center justify-center shadow-lg"
              style={{ minHeight: 'calc(100vh - 200px)' }}
              variants={containerVariants}>
              {isCameraOpen ? (
                <div
                  ref={videoDivRef}
                  className="relative w-full flex flex-col items-center justify-center"
                  style={{
                    height: 'calc(100% - 60px)', // Subtract bottom button height
                    maxHeight: 'calc(100vh - 250px)',
                  }}>
                  <div
                    className="relative w-full overflow-hidden rounded-md bg-white"
                    style={{
                      aspectRatio: '3/4',
                      maxHeight: '100%',
                    }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* 摄像头控制按钮 */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                      {cameras.length > 1 && (
                        <button
                          onClick={switchCamera}
                          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105"
                          title="Switch Camera">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 摄像头选择下拉菜单 */}
                  {cameras.length > 1 && (
                    <div className="mt-4 mb-4 w-full max-w-md mx-auto">
                      <div className="relative">
                        <select
                          value={selectedCamera || ''}
                          onChange={handleCameraChange}
                          className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-md shadow-sm font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#84a59d] focus:border-transparent transition-all duration-200">
                          {cameras.map((camera) => (
                            <option
                              key={camera.deviceId}
                              value={camera.deviceId}>
                              {camera.label ||
                                `Camera ${cameras.indexOf(camera) + 1}`}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                        <div className="absolute left-3 -top-2.5 px-1 bg-white/80 text-xs font-medium text-gray-600 rounded">
                          Select Camera
                        </div>
                      </div>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={handleTakePhoto}
                      className="bg-[#84a59d] hover:bg-[#6b8c85] text-white font-semibold py-2 px-6 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Take Photo
                    </button>
                    <button
                      onClick={handleCloseCamera}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : image ? (
                <div
                  className="relative w-full"
                  style={{
                    height: 'calc(100% - 60px)',
                    maxHeight: 'calc(100vh - 250px)',
                  }}>
                  <Image
                    src={image}
                    alt="Uploaded image"
                    fill
                    className="object-contain rounded-md"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        handleUploadClick();
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105">
                      Change Photo
                    </button>
                    {hasCamera && (
                      <button
                        onClick={(e) => handleCameraClick(e)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Use Camera
                      </button>
                    )}
                    <button
                      onClick={handleDownloadImage}
                      className="bg-[#84a59d] hover:bg-[#6b8c85] text-white font-semibold py-2 px-4 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full bg-white/60 backdrop-blur-xs rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  style={{
                    height: 'calc(100% - 20px)',
                    maxHeight: 'calc(100vh - 250px)',
                  }}
                  onClick={(e) => {
                    // 确保点击空白区域时触发文件上传
                    e.stopPropagation();
                    handleUploadClick();
                  }}>
                  {isUploading ? (
                    <p className="text-gray-600 font-inter">Uploading...</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-400 mb-4 cursor-pointer hover:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-xl font-semibold text-gray-700 mb-2 uppercase tracking-wider font-playfair">
                        UPLOAD YOUR IMAGE HERE
                      </p>
                      <p className="text-sm text-gray-500 font-inter mb-6 cursor-pointer hover:text-gray-700">
                        Click to browse files
                      </p>

                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            handleUploadClick();
                          }}
                          className="bg-[#84a59d] hover:bg-[#6b8c85] text-white font-semibold py-2 px-6 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105">
                          Browse Files
                        </button>
                        {hasCamera && (
                          <button
                            onClick={(e) => handleCameraClick(e)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Use Camera
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="file-upload-input"
              />

              {/* 已处理图片列表 */}
              {processedImages.length > 0 && (
                <div className="w-full mt-4">
                  <button
                    onClick={toggleProcessedImages}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 mr-1 transition-transform ${
                        showProcessedImages ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {showProcessedImages
                      ? 'Hide processing record'
                      : 'Show processing record'}{' '}
                    ({processedImages.length})
                  </button>

                  {showProcessedImages && (
                    <div className="mt-2 bg-white/80 rounded-md p-3 text-xs max-h-32 overflow-y-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-1">Time</th>
                            <th className="text-left py-1">File Name</th>
                            <th className="text-right py-1">Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processedImages.map((img, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100">
                              <td className="py-1">
                                {new Date(img.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-1">{img.fileName}</td>
                              <td className="text-right py-1">
                                {img.size.toFixed(2)} MB
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Right side - Instructions */}
            <motion.div
              className="w-full md:w-1/2 flex flex-col"
              variants={containerVariants}>
              <motion.div
                className="bg-white/40 backdrop-blur-xs rounded-lg flex-grow shadow-sm p-8 border border-white/20"
                variants={itemVariants}>
                <div className="text-gray-700 space-y-6">
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h2 className="text-xl font-bold font-playfair text-gray-800 mb-2">
                      Upload a Clear Picture:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 font-inter">
                      <li>Use a half or full body shot.</li>
                      <li>Preferably choose a front view.</li>
                    </ul>
                  </motion.div>

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h2 className="text-xl font-bold font-playfair text-gray-800 mb-2">
                      Ensure Your Face is Visible:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 font-inter">
                      <li>Wear clothes that do not obscure your face.</li>
                      <li>
                        Avoid overly loose clothing that might cover your
                        features.
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h2 className="text-xl font-bold font-playfair text-gray-800 mb-2">
                      Review Your Picture:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 font-inter">
                      <li>
                        Confirm that the image is clear and meets the
                        guidelines.
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h2 className="text-xl font-bold font-playfair text-gray-800 mb-2">
                      Proceed to the Next Stage:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 font-inter">
                      <li>
                        Once you're satisfied with your picture, click "Next
                        Stage."
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </motion.div>

              <motion.button
                onClick={handleNextClick}
                disabled={!image}
                className={`w-full py-3 px-6 rounded-md text-white font-medium mt-6 shadow-md font-inter ${
                  image
                    ? 'bg-[#84a59d] hover:bg-[#6b8c85]'
                    : 'bg-gray-300 cursor-not-allowed'
                } transition-colors`}
                variants={itemVariants}
                whileHover={image ? { scale: 1.05 } : {}}
                whileTap={image ? { scale: 0.95 } : {}}>
                Next Stage
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
