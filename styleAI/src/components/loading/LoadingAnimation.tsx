'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingAnimation Component
 *
 * A reusable loading animation that shows progress with animated elements.
 *
 * @param {Object} props - Component props
 * @param {number} props.initialProgress - Starting progress value (0-100)
 * @param {boolean} props.autoIncrement - Whether to automatically increment the progress
 * @param {string} props.message - Custom loading message to display
 * @param {boolean} props.showSteps - Whether to show the progress steps
 * @returns {JSX.Element} The loading animation component
 */
export function LoadingAnimation({
  initialProgress = 0,
  autoIncrement = true,
  message = 'Processing your request',
  showSteps = true,
}: {
  initialProgress?: number;
  autoIncrement?: boolean;
  message?: string;
  showSteps?: boolean;
}) {
  const [progress, setProgress] = useState(initialProgress);

  // Auto increment progress if enabled
  useEffect(() => {
    if (!autoIncrement) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 20;

        // Hold at 95% to simulate waiting for completion
        if (newProgress >= 95) {
          return 95;
        }

        return Math.min(newProgress, 100);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [autoIncrement]);

  // Set progress manually from outside
  const setProgressValue = (value: number) => {
    setProgress(Math.min(Math.max(value, 0), 100));
  };

  // Animation variants
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
    <motion.div
      className="max-w-2xl mx-auto flex flex-col items-center justify-center"
      initial="initial"
      animate="animate"
      variants={containerVariants}>
      <motion.div className="mb-8 text-center" variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2 font-playfair text-gray-800">
          {message}
        </h1>
      </motion.div>

      <motion.div
        className="flex flex-col items-center"
        variants={itemVariants}>
        {/* Stylish loading spinner with color accent */}
        <div className="relative w-32 h-32 mb-6">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-gray-200"
            style={{ borderRadius: '50%' }}
          />

          {/* Inner animated arc */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: '#84a59d',
              borderRadius: '50%',
              transform: `rotate(${progress * 3.6}deg)`,
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Percentage display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-2xl font-medium text-gray-700">
              {Math.min(Math.round(progress), 100)}%
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Export the component to be used in other files
export default LoadingAnimation;
