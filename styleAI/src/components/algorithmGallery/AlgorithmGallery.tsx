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
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Navigate to algorithm details page
  const handleCardClick = (id: string) => {
    // Only navigate if drag distance is small (indicating a click, not a drag)
    if (dragDistance < 10) {
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

  // Center the first card
  useEffect(() => {
    const container = containerRef.current;
    if (container && container.children.length > 0) {
      setTimeout(() => {
        const firstCard = container.children[0] as HTMLElement;
        if (firstCard) {
          const cardWidth = firstCard.getBoundingClientRect().width;
          const containerWidth = container.getBoundingClientRect().width;
          // Center the first card
          const scrollPosition = cardWidth / 2 - containerWidth / 2;
          container.scrollLeft = Math.max(0, scrollPosition);
        }
      }, 200);
    }
  }, []);

  // Handle mouse drag events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
      setDragDistance(0);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const distance = Math.abs(x - startX);
    setDragDistance(distance);
    
    // Only scroll if drag distance is significant (more than 5px)
    if (distance > 5) {
      const walk = (x - startX) * 2;
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    // Reset dragging state immediately
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDragDistance(0);
  };

  // Handle touch drag events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current) {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
      setDragDistance(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const distance = Math.abs(x - startX);
    setDragDistance(distance);
    
    // Only scroll if drag distance is significant (more than 5px)
    if (distance > 5) {
      const walk = (x - startX) * 2;
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex items-center justify-center overflow-x-auto py-6 md:py-10 gap-4 md:gap-6 lg:gap-8 no-scrollbar min-h-[400px] md:min-h-[500px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          paddingLeft: 'calc(50vw - 50%)',
          paddingRight: 'calc(50vw - 50%)',
        }}>
        
        {algorithms.map((algorithm) => (
          <div
            key={algorithm.id}
            className="flex-shrink-0 select-none">
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
      </div>

      {/* Scroll indicator */}
      <div className="flex justify-center mt-8 space-x-2">
        <div className="text-base md:text-lg text-gray-600 font-inter font-medium tracking-wide">
          <span className="opacity-75">← scroll to explore more algorithms →</span>
        </div>
      </div>
    </div>
  );
}
