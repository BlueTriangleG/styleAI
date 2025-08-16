'use client';

import { motion } from 'framer-motion';

/**
 * Modern Loading Spinner Component
 * 
 * A beautiful, modern loading animation with floating dots and smooth transitions
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner ('sm', 'md', 'lg', 'xl')
 * @param {string} props.message - Loading message to display
 * @param {string} props.subMessage - Optional sub-message
 * @returns {JSX.Element} Rendered loading spinner
 */
interface ModernLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  subMessage?: string;
}

export function ModernLoadingSpinner({
  size = 'md',
  message = 'Loading...',
  subMessage,
}: ModernLoadingSpinnerProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      dot: 'w-2 h-2',
      text: 'text-sm',
      subText: 'text-xs',
    },
    md: {
      container: 'w-16 h-16',
      dot: 'w-3 h-3',
      text: 'text-base',
      subText: 'text-sm',
    },
    lg: {
      container: 'w-20 h-20',
      dot: 'w-4 h-4',
      text: 'text-lg',
      subText: 'text-base',
    },
    xl: {
      container: 'w-24 h-24',
      dot: 'w-5 h-5',
      text: 'text-xl',
      subText: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  // Animation variants for the container
  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Animation variants for the rotating ring
  const ringVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Animation variants for the floating dots
  const dotVariants = {
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut",
      },
    }),
  };

  // Animation variants for the pulse effect
  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Spinner Container */}
      <div className={`relative ${config.container} mb-4`}>
        {/* Background pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#84a59d]/10"
          variants={pulseVariants}
          animate="animate"
        />
        
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#84a59d]/20"
          variants={ringVariants}
          animate="animate"
        />
        
        {/* Inner rotating ring with gradient */}
        <motion.div
          className="absolute inset-1 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, #84a59d 90deg, transparent 360deg)`,
          }}
          variants={ringVariants}
          animate="animate"
        />
        
        {/* Center dot */}
        <motion.div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${config.dot} bg-[#84a59d] rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            transition: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
        
        {/* Floating dots around the spinner */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#84a59d]/60 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${20 + i * 5}px 0px`,
            }}
            custom={i}
            variants={dotVariants}
            animate="animate"
          />
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 0.3, duration: 0.5 }
        }}
      >
        <motion.p
          className={`${config.text} font-medium text-gray-700 font-inter mb-1`}
          animate={{
            opacity: [0.7, 1, 0.7],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {message}
        </motion.p>
        
        {subMessage && (
          <motion.p
            className={`${config.subText} text-gray-500 font-inter`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.5, duration: 0.5 }
            }}
          >
            {subMessage}
          </motion.p>
        )}
      </motion.div>

      {/* Animated dots below text */}
      <motion.div
        className="flex space-x-1 mt-3"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { delay: 0.7, duration: 0.5 }
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-[#84a59d]/40 rounded-full"
            animate={{
              y: [-2, 2, -2],
              opacity: [0.4, 1, 0.4],
              transition: {
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export default ModernLoadingSpinner;