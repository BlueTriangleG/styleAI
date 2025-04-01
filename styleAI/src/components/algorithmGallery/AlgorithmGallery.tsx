/**
 * AlgorithmGallery component for displaying a horizontal scrollable gallery of algorithm cards
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<Algorithm>} props.algorithms - Array of algorithm objects to display
 * @param {Function} props.onTransitionStart - Optional callback function when starting navigation transition
 */

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { AlgorithmCard } from './AlgorithmCard';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export interface Algorithm {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  bgColor?: string;
}

interface AlgorithmGalleryProps {
  algorithms: Algorithm[];
  onTransitionStart?: (id: string) => void;
}

/**
 * Creates a throttled function that only invokes the provided function at most once per specified wait period
 *
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to throttle
 * @return {Function} The throttled function
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}

export function AlgorithmGallery({
  algorithms,
  onTransitionStart,
}: AlgorithmGalleryProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Navigate to algorithm details page
  const handleCardClick = (id: string) => {
    if (!isDragging) {
      if (onTransitionStart) {
        // Use the transition callback if provided
        onTransitionStart(id);
      } else {
        // Navigate directly to the personalized recommendation upload page with the algorithm ID
        router.push(`/getBestFitCloth/uploadImages?algorithm=${id}`);
      }
    }
  };

  // Handle scroll on mouse wheel with throttling to prevent performance issues
  const handleWheel = useCallback((e: WheelEvent) => {
    if (containerRef.current) {
      e.preventDefault(); // Prevent vertical page scrolling
      containerRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  // Throttled version of the wheel handler
  const throttledWheelHandler = useCallback(
    throttle((e: WheelEvent) => handleWheel(e), 16), // ~60fps
    [handleWheel]
  );

  // Set up and clean up wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Using passive: false to allow preventDefault()
      container.addEventListener('wheel', throttledWheelHandler, {
        passive: false,
      });

      return () => {
        container.removeEventListener('wheel', throttledWheelHandler);
      };
    }
  }, [throttledWheelHandler]);

  // Move first visible card to center on first render
  useEffect(() => {
    const container = containerRef.current;
    if (container && container.children.length > 0) {
      // Get the first card's width
      const cardWidth = container.children[0].getBoundingClientRect().width;
      // Calculate container width
      const containerWidth = container.getBoundingClientRect().width;
      // Scroll to position the first card in the center
      const scrollPosition = cardWidth / 2 - containerWidth / 2 + cardWidth;
      // Set initial scroll position with a slight delay to ensure DOM is ready
      setTimeout(() => {
        container.scrollLeft = Math.max(0, scrollPosition);
      }, 100);
    }
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        ref={containerRef}
        className="flex items-center overflow-x-auto py-6 md:py-10 gap-4 md:gap-6 lg:gap-8 no-scrollbar min-h-[400px] md:min-h-[500px] px-4 sm:px-6 md:px-8"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1} // Make drag feel more natural
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }} // Smoother drag transition
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          // Add a small delay before allowing clicks again to prevent accidental navigation
          setTimeout(() => setIsDragging(false), 100);
        }}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}>
        {algorithms.map((algorithm) => (
          <div
            key={algorithm.id}
            className="flex-shrink-0 select-none"
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
            <AlgorithmCard
              id={algorithm.id}
              title={algorithm.title}
              description={algorithm.description}
              imageUrl={algorithm.imageUrl}
              bgColor={algorithm.bgColor}
              onSelect={handleCardClick}
            />
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        <div className="text-sm text-gray-500">
          <span>← scroll to explore more algorithms →</span>
        </div>
      </div>
    </div>
  );
}
