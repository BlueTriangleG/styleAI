/**
 * SectionHeader component for displaying section titles and descriptions
 * @component
 * @param {string} title - The main title of the section
 * @param {string} description - Optional description text
 * @param {string} className - Optional additional CSS classes
 */

import { cn } from "@/lib/utils";

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
    <div className={cn("mb-8 text-center", className)}>
      <h2 className="text-3xl md:text-4xl font-bold text-[#2D4B37] mb-3 font-playfair">
        {title}
      </h2>
      {description && (
        <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
      )}
    </div>
  );
}
