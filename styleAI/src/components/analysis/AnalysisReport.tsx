import { motion } from 'framer-motion';
import { AnalysisPoint } from '@/constants/defaultAnalysisData';
import { ModernLoadingSpinner } from '@/components/loading/ModernLoadingSpinner';

/**
 * Props for the AnalysisReport component
 */
interface AnalysisReportProps {
  isLoadingAnalysis: boolean;
  analysisError: string | null;
  jobId: string;
  overallDescription: string;
  analysisPoints: AnalysisPoint[];
  recommendedStyles: string[];
}

/**
 * Animation variants for content reveal
 */
const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const listVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * AnalysisReport Component
 *
 * Displays the user's style analysis results including overall description,
 * specific analysis points, and recommended styles.
 *
 * @param {AnalysisReportProps} props - Component properties
 * @returns {JSX.Element} Rendered component
 */
export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  isLoadingAnalysis,
  analysisError,
  jobId,
  overallDescription,
  analysisPoints,
  recommendedStyles,
}) => {
  if (isLoadingAnalysis) {
    return (
      <div className="flex justify-center items-center h-64">
        <ModernLoadingSpinner 
          size="md"
          message="Loading analysis..."
          subMessage="Processing your style data"
        />
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Analysis Error</p>
          <p className="text-gray-600 text-sm mt-1">{analysisError}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 mb-8"
      initial="initial"
      animate="animate"
      variants={contentVariants}
    >
      {/* Data source info */}
      <div className="text-sm text-gray-500 mb-4">
        Data source: {jobId ? `API (JobID: ${jobId})` : 'Local storage'}
      </div>

      <div className="max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#84a59d]/40 scrollbar-track-[#84a59d]/10">
        {overallDescription ? (
          // Overall description section
          <motion.div
            className="bg-[#84a59d]/10 p-6 rounded-lg mb-6 shadow-sm"
            variants={contentVariants}
          >
            <h3 className="text-xl font-bold font-playfair text-gray-800 mb-4 border-b border-[#84a59d]/20 pb-2">
              Your Overall Style Description
            </h3>
            <div className="text-gray-700 font-inter leading-relaxed">
              {typeof overallDescription === 'object' 
                ? JSON.stringify(overallDescription) 
                : overallDescription}
            </div>
          </motion.div>
        ) : (
          // Analysis points section
          <motion.div
            variants={listVariants}
            initial="initial"
            animate="animate"
          >
            {Array.isArray(analysisPoints) &&
              analysisPoints.map((point, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="mb-6 p-4 bg-white/50 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#84a59d] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-2 font-playfair">
                        {point.title}
                      </h4>
                      <p className="text-gray-600 font-inter leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}

        {/* Recommended styles section */}
        {Array.isArray(recommendedStyles) && recommendedStyles.length > 0 && (
          <motion.div
            className="mt-8 p-6 bg-gradient-to-r from-[#84a59d]/10 to-[#84a59d]/5 rounded-lg shadow-sm"
            variants={contentVariants}
          >
            <h4 className="font-bold text-gray-800 mb-4 font-playfair text-lg border-b border-[#84a59d]/20 pb-2">
              Recommended Styles for You
            </h4>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              variants={listVariants}
            >
              {recommendedStyles.map((style, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white/70 px-4 py-2 rounded-md shadow-sm border border-[#84a59d]/20"
                >
                  <span className="text-gray-700 font-inter font-medium">
                    {style}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};