'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tilt } from '@/components/ui/tilt';
import * as faceapi from 'face-api.js';
import {
  processImageClient,
  downloadImage,
  getProcessedImagesInfo,
} from '@/lib/imageProcessor';

/**
 * Interface for UploadImageComponent props
 */
interface UploadImageComponentProps {
  /** The current image data URL */
  image: string | null;
  /** Function to set the image data */
  setImage: (image: string | null) => void;
  /** Animation variants for the container */
  containerVariants?: any;
}

/**
 * Component for uploading and capturing images with face detection
 */
export const UploadImageComponent: React.FC<UploadImageComponentProps> = ({
  image,
  setImage,
  containerVariants = {},
}) => {
  // State for managing upload and camera functionality
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [processedImages, setProcessedImages] = useState<
    Array<{ timestamp: string; fileName: string; size: number }>
  >([]);
  const [showProcessedImages, setShowProcessedImages] = useState(false);
  const [showDetectionInPhoto, setShowDetectionInPhoto] = useState(true);

  // Face detection state
  const [faceDetection, setFaceDetection] = useState<{
    jawOutline: Array<{ x: number; y: number }>;
    nose: Array<{ x: number; y: number }>;
    leftEye: Array<{ x: number; y: number }>;
    rightEye: Array<{ x: number; y: number }>;
    leftEyeBrow: Array<{ x: number; y: number }>;
    rightEyeBrow: Array<{ x: number; y: number }>;
    mouth: Array<{ x: number; y: number }>;
    box: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Refs for DOM elements and tracking
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoDivRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceDetectionInterval = useRef<number | null>(null);

  // Add a new ref to store the previous image state
  const previousImageRef = useRef<string | null>(null);

  /**
   * Check if device has camera capabilities
   */
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCamera(true);

          if (navigator.mediaDevices.enumerateDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
              (device) => device.kind === 'videoinput'
            );
            setCameras(videoDevices);

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

  /**
   * Load face detection models
   */
  useEffect(() => {
    async function loadFaceApiModels() {
      try {
        const basePath = '/styleai';
        const MODEL_URL = `${basePath}/models`;

        console.log('Loading face detection models from:', MODEL_URL);

        await faceapi.nets.tinyFaceDetector.loadFromUri(
          MODEL_URL + '/tiny_face_detector'
        );

        await faceapi.nets.faceLandmark68Net.loadFromUri(
          MODEL_URL + '/face_landmark_68'
        );

        console.log('Face detection models loaded successfully');
      } catch (error) {
        console.error('Error loading face detection models:', error);
      }
    }

    loadFaceApiModels();
  }, []);

  /**
   * Load processed image information
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const images = getProcessedImagesInfo();
      setProcessedImages(images);
    }
  }, []);

  /**
   * Handle file selection from input
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selection event triggered', e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    setIsUploading(true);

    try {
      console.log(
        `Processing file: ${file.name}, type: ${file.type}, size: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );

      const processedImage = await processImageClient(file, 5);

      const images = getProcessedImagesInfo();
      setProcessedImages(images);

      setImage(processedImage);
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    console.log('Triggering file upload click event');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Switch between front and back cameras
   */
  const switchCamera = async () => {
    console.log('Switching camera');

    // Toggle between front and back cameras
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // If there are multiple cameras, cycle through them
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(
        (camera) => camera.deviceId === selectedCamera
      );
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamera = cameras[nextIndex].deviceId;

      console.log(
        `Switching from camera index ${currentIndex} to ${nextIndex}`
      );
      setSelectedCamera(nextCamera);

      // Start the camera with the new device ID
      const success = await startCamera(newFacingMode, nextCamera);

      if (!success) {
        console.error('Failed to switch camera');
        // Try to fall back to the original camera
        if (currentIndex !== nextIndex) {
          setSelectedCamera(cameras[currentIndex].deviceId);
          await startCamera(facingMode, cameras[currentIndex].deviceId);
        }
      }
    } else {
      // If only one camera, just switch the facing mode
      await startCamera(newFacingMode);
    }
  };

  /**
   * Select specific camera by device ID
   */
  const handleCameraChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const deviceId = e.target.value;
    setSelectedCamera(deviceId);
    await startCamera(facingMode, deviceId);
  };

  /**
   * Start camera with specified facing mode and device ID
   */
  const startCamera = async (
    facingMode: 'user' | 'environment' = 'user',
    deviceId?: string
  ) => {
    try {
      // Stop any existing video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Stop face detection if it's running
      if (faceDetectionInterval.current !== null) {
        cancelAnimationFrame(faceDetectionInterval.current);
        faceDetectionInterval.current = null;
        setFaceDetection(null);
      }

      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      };

      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        videoConstraints.facingMode = facingMode;
      }

      console.log(
        'Starting camera with constraints:',
        deviceId ? `Device ID: ${deviceId}` : `Facing mode: ${facingMode}`
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Ensure video element properly loads the new stream
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                console.log('New camera stream started playing');
              })
              .catch((err) => {
                console.error('Error playing video after camera switch:', err);
              });
          }
        };
      }

      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      return false;
    }
  };

  /**
   * Open camera for taking photos
   */
  const handleCameraClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Store the current image for potential restoration
    previousImageRef.current = image;

    setIsCameraOpen(true);
    const success = await startCamera(facingMode, selectedCamera || undefined);
    if (!success) {
      setIsCameraOpen(false);
    }
  };

  /**
   * Detect faces in video stream
   */
  const detectFaces = async () => {
    if (!videoRef.current || !videoDivRef.current || !isCameraOpen) {
      return;
    }

    const video = videoRef.current;
    const videoDiv = videoDivRef.current;

    if (video.paused || video.ended || video.videoWidth === 0) {
      faceDetectionInterval.current = requestAnimationFrame(detectFaces);
      return;
    }

    try {
      console.log('Detecting faces...');
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks();

      console.log(`Detected ${detections.length} faces`);

      if (detections.length > 0) {
        // get the video element's bounding client rect
        const videoRect = video.getBoundingClientRect();
        const containerWidth = videoRect.width;
        const containerHeight = videoRect.height;

        // Guard against invalid dimensions
        if (
          containerWidth === 0 ||
          containerHeight === 0 ||
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {
          console.log(
            'Invalid video dimensions, skipping face detection rendering'
          );
          faceDetectionInterval.current = requestAnimationFrame(detectFaces);
          return;
        }

        // calculate the actual display area's size and offset (object-contain calculation formula)
        const scale = Math.min(
          containerWidth / video.videoWidth,
          containerHeight / video.videoHeight
        );
        const displayedWidth = video.videoWidth * scale;
        const displayedHeight = video.videoHeight * scale;
        const offsetX = (containerWidth - displayedWidth) / 2;
        const offsetY = (containerHeight - displayedHeight) / 2;

        // use the actual display area's size to scale the detection results
        const displaySize = { width: displayedWidth, height: displayedHeight };

        // Only resize results if displaySize dimensions are valid
        if (displaySize.width > 0 && displaySize.height > 0) {
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          // update the detection state, and pass the calculated offset to the rendering layer
          const detection = resizedDetections[0];
          setFaceDetection({
            jawOutline: detection.landmarks.getJawOutline().map((p) => ({
              x: p.x + offsetX,
              y: p.y + offsetY,
            })),
            nose: detection.landmarks.getNose().map((p) => ({
              x: p.x + offsetX,
              y: p.y + offsetY,
            })),
            leftEye: detection.landmarks.getLeftEye().map((p) => ({
              x: p.x + offsetX,
              y: p.y + offsetY,
            })),
            rightEye: detection.landmarks.getRightEye().map((p) => ({
              x: p.x + offsetX,
              y: p.y + offsetY,
            })),
            leftEyeBrow: detection.landmarks.getLeftEyeBrow().map((p) => ({
              x: p.x + offsetX,
              y: p.y + offsetY,
            })),
            rightEyeBrow: detection.landmarks.getRightEyeBrow().map((p) => ({
              x: p.x + offsetX,
              y: p.y + offsetY,
            })),
            mouth: detection.landmarks.getMouth().map((p) => ({
              x: p.x + offsetX,
              y: p.y + offsetY,
            })),
            box: {
              x: detection.detection.box.x + offsetX,
              y: detection.detection.box.y + offsetY,
              width: detection.detection.box.width,
              height: detection.detection.box.height,
            },
          });
        } else {
          console.warn(
            'Invalid display size dimensions, skipping face detection update'
          );
        }
      } else {
        setFaceDetection(null);
      }
    } catch (error) {
      console.error('Error detecting face landmarks:', error);
      setFaceDetection(null);
    }

    // Only continue if we haven't been canceled during processing
    if (isCameraOpen) {
      faceDetectionInterval.current = requestAnimationFrame(detectFaces);
    }
  };

  /**
   * Start face detection when camera opens
   */
  useEffect(() => {
    if (isCameraOpen && videoRef.current) {
      console.log('Camera is open, setting up face detection');

      const startDetection = () => {
        console.log('Video is now playing, starting face detection');
        if (faceDetectionInterval.current === null) {
          detectFaces();
        }
      };

      videoRef.current.addEventListener('playing', startDetection);

      const timeoutId = setTimeout(() => {
        if (
          videoRef.current &&
          !videoRef.current.paused &&
          faceDetectionInterval.current === null
        ) {
          console.log('Starting face detection via timeout');
          detectFaces();
        }
      }, 1000);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('playing', startDetection);
        }

        clearTimeout(timeoutId);

        if (faceDetectionInterval.current !== null) {
          console.log('Cleaning up face detection');
          cancelAnimationFrame(faceDetectionInterval.current);
          faceDetectionInterval.current = null;
        }

        setFaceDetection(null);
      };
    }
  }, [isCameraOpen]);

  /**
   * Reset face detection when selected camera changes
   * This ensures face detection is restarted when switching cameras
   */
  useEffect(() => {
    if (isCameraOpen && selectedCamera && videoRef.current) {
      // Clear existing detection
      if (faceDetectionInterval.current !== null) {
        cancelAnimationFrame(faceDetectionInterval.current);
        faceDetectionInterval.current = null;
      }

      // Wait for video to update with new camera
      const timeoutId = setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          console.log('Restarting face detection after camera switch');
          detectFaces();
        }
      }, 500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [selectedCamera]);

  /**
   * Stop camera stream and face detection
   */
  const handleCloseCamera = () => {
    // First flag the camera as closed to stop any new detection cycles
    setIsCameraOpen(false);

    // Clear face detection immediately to avoid any further rendering
    setFaceDetection(null);

    // Cancel any pending animation frame first
    if (faceDetectionInterval.current !== null) {
      cancelAnimationFrame(faceDetectionInterval.current);
      faceDetectionInterval.current = null;
    }

    // After ensuring detection is stopped, clean up the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear the video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  /**
   * Take a photo from the camera stream
   */
  const handleTakePhoto = async () => {
    if (videoRef.current && canvasRef.current && videoDivRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const videoDiv = videoDivRef.current;

      // Get the actual displayed video dimensions and position
      const videoRect = video.getBoundingClientRect();

      // Set canvas to match the EXACT size of the displayed video
      canvas.width = videoRect.width;
      canvas.height = videoRect.height;

      // Use the same scale calculations as in face detection
      const scale = Math.min(
        videoRect.width / video.videoWidth,
        videoRect.height / video.videoHeight
      );

      const displayedWidth = video.videoWidth * scale;
      const displayedHeight = video.videoHeight * scale;
      const offsetX = (videoRect.width - displayedWidth) / 2;
      const offsetY = (videoRect.height - displayedHeight) / 2;

      const context = canvas.getContext('2d');
      if (context) {
        // Fill with white background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame exactly as it appears in the display
        context.drawImage(
          video,
          0,
          0,
          video.videoWidth,
          video.videoHeight,
          offsetX,
          offsetY,
          displayedWidth,
          displayedHeight
        );

        // If face detection is active and user wants to show detection points
        if (faceDetection && showDetectionInPhoto) {
          // Since we're using the exact same dimensions and offsets as the detection algorithm,
          // we can use the detection coordinates directly without additional transformations

          // Draw box
          context.strokeStyle = 'rgba(255, 0, 0, 0.7)';
          context.lineWidth = 2;
          context.strokeRect(
            faceDetection.box.x,
            faceDetection.box.y,
            faceDetection.box.width,
            faceDetection.box.height
          );

          // Function to draw points
          const drawPoints = (
            points: Array<{ x: number; y: number }>,
            color: string,
            size: number = 1.5
          ) => {
            context.fillStyle = color;
            points.forEach((point) => {
              context.beginPath();
              context.arc(point.x, point.y, size, 0, 2 * Math.PI);
              context.fill();
            });
          };

          // Draw facial features with appropriate colors
          drawPoints(faceDetection.jawOutline, 'rgba(255, 165, 0, 0.7)', 1); // Orange for jaw
          drawPoints(faceDetection.leftEye, 'rgba(0, 0, 255, 0.7)', 1.5); // Blue for eyes
          drawPoints(faceDetection.rightEye, 'rgba(0, 0, 255, 0.7)', 1.5);
          drawPoints(faceDetection.leftEyeBrow, 'rgba(128, 0, 128, 0.7)', 1.5); // Purple for eyebrows
          drawPoints(faceDetection.rightEyeBrow, 'rgba(128, 0, 128, 0.7)', 1.5);
          drawPoints(faceDetection.nose, 'rgba(0, 128, 0, 0.7)', 1.5); // Green for nose
          drawPoints(faceDetection.mouth, 'rgba(255, 0, 128, 0.7)', 1.5); // Pink for mouth
        }

        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);

        try {
          const processedImage = await processImageClient(photoDataUrl, 5);

          const images = getProcessedImagesInfo();
          setProcessedImages(images);

          setImage(processedImage);
        } catch (error) {
          console.error('Error processing photo:', error);
          setImage(photoDataUrl);
        }

        handleCloseCamera();
      }
    }
  };

  /**
   * Clean up camera stream when component unmounts
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /**
   * Download current image
   */
  const handleDownloadImage = () => {
    if (image) {
      downloadImage(image, `styleAI_image_${new Date().getTime()}.jpg`);
    }
  };

  /**
   * Toggle visibility of processed images list
   */
  const toggleProcessedImages = () => {
    setShowProcessedImages(!showProcessedImages);
  };

  return (
    <>
      <motion.div
        className="w-full md:w-1/2 bg-white/60 backdrop-blur-xs rounded-lg p-4 flex flex-col items-center justify-center shadow-lg"
        style={{ minHeight: 'calc(100vh - 200px)' }}
        variants={containerVariants}>
        {isCameraOpen ? (
          <div
            ref={videoDivRef}
            className="relative w-full flex flex-col items-center justify-center"
            style={{
              height: 'calc(100% - 60px)',
              maxHeight: 'calc(100vh - 250px)',
            }}>
            <div
              className="relative w-full overflow-hidden rounded-md bg-white"
              style={{
                height: '100%',
                maxHeight: '100%',
              }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Face detection visualization using absolute positioned DOM elements */}
              {faceDetection && (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ zIndex: 9999 }}>
                  {/* Debug info */}
                  <div
                    className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-sm font-bold"
                    style={{ zIndex: 10000 }}>
                    Face Detected
                  </div>

                  {/* Face box */}
                  <div
                    className="absolute border-4 border-orange-500"
                    style={{
                      left: `${faceDetection.box.x}px`,
                      top: `${faceDetection.box.y}px`,
                      width: `${faceDetection.box.width}px`,
                      height: `${faceDetection.box.height}px`,
                      boxShadow: '0 0 10px rgba(255, 87, 34, 0.7)',
                    }}
                  />

                  {/* Eyes */}
                  {faceDetection.leftEye.map(
                    (point: { x: number; y: number }, i: number) => (
                      <div
                        key={`leftEye-${i}`}
                        className="absolute bg-blue-500 rounded-full"
                        style={{
                          left: `${point.x}px`,
                          top: `${point.y}px`,
                          width: '4px',
                          height: '4px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  )}

                  {faceDetection.rightEye.map(
                    (point: { x: number; y: number }, i: number) => (
                      <div
                        key={`rightEye-${i}`}
                        className="absolute bg-blue-500 rounded-full"
                        style={{
                          left: `${point.x}px`,
                          top: `${point.y}px`,
                          width: '4px',
                          height: '4px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  )}

                  {/* Eyebrows */}
                  {faceDetection.leftEyeBrow.map(
                    (point: { x: number; y: number }, i: number) => (
                      <div
                        key={`leftEyeBrow-${i}`}
                        className="absolute bg-purple-500 rounded-full"
                        style={{
                          left: `${point.x}px`,
                          top: `${point.y}px`,
                          width: '4px',
                          height: '4px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  )}

                  {faceDetection.rightEyeBrow.map(
                    (point: { x: number; y: number }, i: number) => (
                      <div
                        key={`rightEyeBrow-${i}`}
                        className="absolute bg-purple-500 rounded-full"
                        style={{
                          left: `${point.x}px`,
                          top: `${point.y}px`,
                          width: '4px',
                          height: '4px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  )}

                  {/* Nose */}
                  {faceDetection.nose.map(
                    (point: { x: number; y: number }, i: number) => (
                      <div
                        key={`nose-${i}`}
                        className="absolute bg-green-500 rounded-full"
                        style={{
                          left: `${point.x}px`,
                          top: `${point.y}px`,
                          width: '4px',
                          height: '4px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  )}

                  {/* Mouth */}
                  {faceDetection.mouth.map(
                    (point: { x: number; y: number }, i: number) => (
                      <div
                        key={`mouth-${i}`}
                        className="absolute bg-pink-500 rounded-full"
                        style={{
                          left: `${point.x}px`,
                          top: `${point.y}px`,
                          width: '4px',
                          height: '4px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  )}

                  {/* Jaw */}
                  {faceDetection.jawOutline.map(
                    (point: { x: number; y: number }, i: number) => (
                      <div
                        key={`jaw-${i}`}
                        className="absolute bg-orange-500 rounded-full"
                        style={{
                          left: `${point.x}px`,
                          top: `${point.y}px`,
                          width: '4px',
                          height: '4px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {/* Camera controls section - Moved all controls below the camera */}
            <div className="w-full mt-4 flex flex-col items-center space-y-4">
              {/* Camera select dropdown */}
              {cameras.length > 1 && (
                <div className="w-full max-w-md">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Select Camera
                    </label>
                    <select
                      value={selectedCamera || ''}
                      onChange={handleCameraChange}
                      className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#84a59d] focus:border-transparent">
                      {cameras.map((camera) => (
                        <option key={camera.deviceId} value={camera.deviceId}>
                          {camera.label ||
                            `Camera ${cameras.indexOf(camera) + 1}`}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera action buttons */}
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={handleTakePhoto}
                  className="bg-[#84a59d] hover:bg-[#6b8c85] text-white font-semibold py-2 px-6 rounded-md shadow-md transition-all duration-200 hover:scale-105">
                  Take Photo
                </button>
                <button
                  onClick={() => {
                    handleCloseCamera();
                    // If we had an image before opening camera, restore it
                    if (previousImageRef.current) {
                      setImage(previousImageRef.current);
                    }
                    // Clear the reference
                    previousImageRef.current = null;
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md shadow-md transition-all duration-200 hover:scale-105">
                  Cancel
                </button>
              </div>

              {/* Detection points toggle */}
              <div className="flex items-center mt-4 bg-white/80 py-2 px-3 rounded-md shadow-sm">
                <input
                  type="checkbox"
                  id="showDetectionToggle"
                  checked={showDetectionInPhoto}
                  onChange={(e) => setShowDetectionInPhoto(e.target.checked)}
                  className="mr-2 h-4 w-4 accent-[#84a59d] rounded"
                />
                <label
                  htmlFor="showDetectionToggle"
                  className="text-sm text-gray-700">
                  Include facial recognition markers in captured photo
                </label>
              </div>
            </div>
          </div>
        ) : image ? (
          <Tilt
            rotationFactor={5}
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
                  e.stopPropagation();
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
          </Tilt>
        ) : (
          <div
            className="w-full bg-white/60 backdrop-blur-xs rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            style={{
              height: 'calc(100% - 20px)',
              maxHeight: 'calc(100vh - 250px)',
            }}
            onClick={(e) => {
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
                      e.stopPropagation();
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

        {/* Canvas for photo capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Processed images list */}
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
                      <tr key={index} className="border-b border-gray-100">
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
    </>
  );
};
