import { motion } from 'framer-motion';

/**
 * Props for the ScrollIndicator component
 */
interface ScrollIndicatorProps {
  showScrollIndicator: boolean;
  onScroll: () => void;
}

/**
 * Animation variants for the scroll indicator
 */
const scrollIndicatorVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: [0, 1, 0],
    y: [0, 10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
};

/**
 * ScrollIndicator Component
 *
 * Displays an animated scroll indicator to guide users to scroll down
 * for more content. Only shows when explicitly enabled.
 *
 * @param {ScrollIndicatorProps} props - Component properties
 * @returns {JSX.Element | null} Rendered component or null if hidden
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  showScrollIndicator,
  onScroll,
}) => {
  if (!showScrollIndicator) return null;

  return (
    <motion.div
      className="flex flex-col items-center mt-12 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}>
      <p className="text-gray-600 font-inter mb-2 text-center">
        Scroll down to see your style recommendations
      </p>
      <motion.div
        variants={scrollIndicatorVariants}
        initial="initial"
        animate="animate"
        onClick={onScroll}
        className="cursor-pointer bg-[#84a59d]/10 hover:bg-[#84a59d]/20 p-3 rounded-full transition-all duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#84a59d]">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </motion.div>
  );
};
