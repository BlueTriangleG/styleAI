/**
 * SectionHeader component for displaying section titles and descriptions
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The main title of the section
 * @param {string} props.description - Optional description text
 * @param {string} props.className - Optional additional CSS classes
 */

import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-12 text-center', className)}>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D4B37] mb-6 font-playfair leading-tight tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-4xl mx-auto font-inter leading-relaxed font-light">
          {description}
        </p>
      )}
    </div>
  );
}
