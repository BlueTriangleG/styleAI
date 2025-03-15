'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RecommendationHeader } from '@/components/recommendation/Header';
import { motion } from 'framer-motion';
import LiquidChrome from '@/components/background/LiquidChrome';

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

  // Check if device has camera
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          // Just check if getUserMedia is supported
          await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCamera(true);

          // 获取所有可用的视频输入设备
          if (navigator.mediaDevices.enumerateDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
              (device) => device.kind === 'videoinput'
            );
            setCameras(videoDevices);

            // 如果有摄像头，默认选择第一个
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 切换摄像头
  const switchCamera = async () => {
    // 切换前后摄像头
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // 如果有多个摄像头，尝试找到对应的设备
    if (cameras.length > 1) {
      // 找到下一个摄像头
      const currentIndex = cameras.findIndex(
        (camera) => camera.deviceId === selectedCamera
      );
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCamera(cameras[nextIndex].deviceId);
    }

    // 重新打开摄像头
    await startCamera(newFacingMode);
  };

  // 选择特定摄像头
  const handleCameraChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const deviceId = e.target.value;
    setSelectedCamera(deviceId);
    await startCamera(facingMode, deviceId);
  };

  // 启动摄像头
  const startCamera = async (
    facingMode: 'user' | 'environment' = 'user',
    deviceId?: string
  ) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // 构建视频约束
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: 3 / 4,
      };

      // 如果指定了设备ID，优先使用设备ID
      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        // 否则使用facingMode
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
  const handleCameraClick = async () => {
    setIsCameraOpen(true);
    const success = await startCamera(facingMode, selectedCamera || undefined);
    if (!success) {
      setIsCameraOpen(false);
    }
  };

  // Take photo
  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current && videoDivRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const videoDiv = videoDivRef.current;

      // 获取视频容器的尺寸
      const containerWidth = videoDiv.clientWidth;
      const containerHeight = videoDiv.clientHeight;

      // 设置canvas尺寸为容器尺寸，保持长方形比例
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // 计算视频在容器中的位置和尺寸
      const videoRatio = video.videoWidth / video.videoHeight;
      const containerRatio = containerWidth / containerHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (videoRatio > containerRatio) {
        // 视频比容器更宽，以高度为基准
        drawHeight = containerHeight;
        drawWidth = video.videoWidth * (containerHeight / video.videoHeight);
        offsetX = (containerWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        // 视频比容器更高，以宽度为基准
        drawWidth = containerWidth;
        drawHeight = video.videoHeight * (containerWidth / video.videoWidth);
        offsetX = 0;
        offsetY = (containerHeight - drawHeight) / 2;
      }

      // 绘制视频帧到canvas
      const context = canvas.getContext('2d');
      if (context) {
        // 先清空canvas
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制视频帧
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

        // 转换为数据URL
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setImage(photoDataUrl);

        // 关闭摄像头
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
        sessionStorage.setItem('userImage', image);
      }

      // Start transition animation
      setIsTransitioning(true);

      // Navigate to the loading page after animation completes
      setTimeout(() => {
        router.push('/personalized-recommendation/loading');
      }, 500); // Match this with animation duration
    }
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
      <RecommendationHeader />
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
                    height: 'calc(100% - 60px)', // 减去底部按钮的高度
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
                      onClick={handleUploadClick}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105">
                      Change Photo
                    </button>
                    {hasCamera && (
                      <button
                        onClick={handleCameraClick}
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
                  </div>
                </div>
              ) : (
                <div
                  className="w-full bg-white/60 backdrop-blur-xs rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  style={{
                    height: 'calc(100% - 20px)',
                    maxHeight: 'calc(100vh - 250px)',
                  }}>
                  {isUploading ? (
                    <p className="text-gray-600 font-inter">Uploading...</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-400 mb-4"
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
                      <p className="text-sm text-gray-500 font-inter mb-6">
                        Click to browse files
                      </p>

                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-2">
                        <button
                          onClick={handleUploadClick}
                          className="bg-[#84a59d] hover:bg-[#6b8c85] text-white font-semibold py-2 px-6 rounded-md shadow-md font-inter transition-all duration-200 hover:scale-105">
                          Browse Files
                        </button>
                        {hasCamera && (
                          <button
                            onClick={handleCameraClick}
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
              />
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
