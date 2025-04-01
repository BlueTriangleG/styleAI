'use client';

import React, { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  SpringOptions,
} from 'framer-motion';

/**
 * Spotlight component that creates a spotlight/glow effect that follows cursor movement
 *
 * @param className - Optional CSS class names for styling the spotlight
 * @param size - Size of the spotlight in pixels
 * @param color - CSS color for the spotlight gradient (optional)
 * @param springOptions - Configuration for the spring animation (optional)
 */
type SpotlightProps = {
  className?: string;
  size?: number;
  color?: string;
  springOptions?: SpringOptions;
};

export function Spotlight({
  className,
  size = 200,
  color = 'white',
  springOptions,
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const xSpring = useSpring(mouseX, springOptions);
  const ySpring = useSpring(mouseY, springOptions);

  const background = useMotionTemplate`radial-gradient(${size}px circle at ${xSpring}px ${ySpring}px, ${color}, transparent)`;

  /**
   * Handles mouse movement over the component
   * Updates motion values based on cursor position
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  /**
   * Resets the spotlight position when mouse leaves
   */
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 ${className}`}
      style={{ background }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}
