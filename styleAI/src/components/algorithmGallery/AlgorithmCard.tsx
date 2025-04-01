/**
 * AlgorithmCard component for displaying individual algorithm options
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the algorithm
 * @param {string} props.description - Short description of the algorithm
 * @param {string} props.imageUrl - URL of the algorithm preview image
 * @param {string} props.id - Unique identifier for the algorithm
 * @param {Function} props.onSelect - Callback function when algorithm is clicked
 * @param {string} props.bgColor - Fallback background color if image fails to load
 */

import { GlareCard } from '@/components/ui/glare-card';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AlgorithmCardProps {
  title: string;
  description: string;
  imageUrl: string;
  id: string;
  onSelect?: (id: string) => void;
  bgColor?: string;
}

export function AlgorithmCard({
  title,
  description,
  imageUrl,
  id,
  onSelect,
  bgColor = '#2D4B37',
}: AlgorithmCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 transform cursor-pointer mx-auto',
        isHovered ? 'scale-105' : ''
      )}
      onClick={() => onSelect?.(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Responsive wrapper with adaptive sizing based on screen width */}
      <div className="w-[66vw] h-[88vw] sm:w-[50vw] sm:h-[66vw] md:w-[33vw] md:h-[44vw] lg:w-[25vw] lg:h-[33vw] xl:w-[20vw] xl:h-[26vw] max-w-[450px] max-h-[600px]">
        <GlareCard className="flex flex-col items-start justify-end h-full">
          <div
            className="absolute inset-0 z-0"
            style={{ backgroundColor: bgColor }}>
            {!imageError && imageUrl && (
              <div className="relative w-full h-full">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover rounded-[var(--radius)]"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
            )}
            {/* Always show gradient overlay for text readability */}
            {imageError && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            )}
          </div>

          <div className="relative z-10 p-6 md:p-8 text-white">
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
              {title}
            </h3>
            <p className="text-sm md:text-base text-gray-200">{description}</p>

            {/* Button-like indicator on hover */}
            <div
              className={cn(
                'absolute bottom-6 right-6 md:bottom-8 md:right-8 bg-white/90 text-black rounded-full p-2 md:p-3 transition-all duration-300 shadow-md',
                isHovered
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              )}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="md:w-5 md:h-5">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </GlareCard>
      </div>
    </div>
  );
}
