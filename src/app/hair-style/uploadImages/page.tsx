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

      try {
        // Make canvas visible temporarily for face detection visualization
        canvas.classList.remove('hidden');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '10';

        // Get the display size for face-api
        const displaySize = {
          width: containerWidth,
          height: containerHeight,
        };

        // Match dimensions for face API
        faceapi.matchDimensions(canvas, displaySize);

        // Detect faces with landmarks
        const detections = await faceapi
          .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length > 0) {
          console.log(`Detected ${detections.length} face(s) with landmarks`);

          // Resize detections to match display size
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          // Clear the canvas and redraw the video frame
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
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

          // Draw face landmarks
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          // Show the canvas with landmarks for a moment
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          console.log('No faces detected');
        }

        // Convert to data URL after showing landmarks
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);

        // Process the image
        const processedImage = await processImageClient(photoDataUrl, 5);

        // Update processed image list
        const images = getProcessedImagesInfo();
        setProcessedImages(images);

        setImage(processedImage);

        // Hide canvas again
        canvas.classList.add('hidden');
      } catch (error) {
        console.error('Error processing photo with face detection:', error);

        // Fallback: convert to data URL without face detection
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);

        try {
          // Use new image processing feature to process photo
          const processedImage = await processImageClient(photoDataUrl, 5);

          // Update processed image list
          const images = getProcessedImagesInfo();
          setProcessedImages(images);

          setImage(processedImage);
        } catch (procError) {
          console.error('Error processing photo:', procError);
          setImage(photoDataUrl); // If processing fails, use original image
        }
      }

      // Close camera
      handleCloseCamera();
    }
  }
};
