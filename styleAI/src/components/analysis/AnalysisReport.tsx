import { motion } from 'framer-motion';
import { AnalysisPoint } from '@/constants/defaultAnalysisData';

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
  typingComplete: number;
}

/**
 * Animation variants for text reveal effects
 */
const textRevealVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
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
  typingComplete,
}) => {
  if (isLoadingAnalysis) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-[#84a59d] animate-spin-slow mb-4"
            viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
              opacity="0.25"
            />
            <path
              fill="currentColor"
              d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
            />
          </svg>
          <p className="text-gray-500 font-inter">
            Loading analysis results...
          </p>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return <div className="text-red-500 mb-4">{analysisError}</div>;
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="text-sm text-gray-500 mb-4">
        Data source: {jobId ? `API (JobID: ${jobId})` : 'Local storage'}
      </div>

      <div className="max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#84a59d]/40 scrollbar-track-[#84a59d]/10">
        {overallDescription ? (
          <div className="bg-[#84a59d]/10 p-6 rounded-lg mb-6 shadow-sm">
            <h3 className="text-xl font-bold font-playfair text-gray-800 mb-4 border-b border-[#84a59d]/20 pb-2">
              Your Overall Style Description
            </h3>
            <p className="text-gray-700 font-inter leading-relaxed">
              {typeof overallDescription === 'object'
                ? JSON.stringify(overallDescription)
                : overallDescription}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 p-6 rounded-lg mb-6 shadow-sm">
            <h3 className="text-xl font-bold font-playfair text-gray-800 mb-4 border-b border-yellow-200 pb-2">
              Overall Description Not Found
            </h3>
            <p className="text-gray-700 font-inter leading-relaxed">
              The system couldn't find your overall description. Please try
              uploading another image or contact customer support.
            </p>
          </div>
        )}

        {!overallDescription &&
          Array.isArray(analysisPoints) &&
          analysisPoints.map((point, index) => (
            <motion.div
              key={index}
              initial="initial"
              animate={typingComplete > index ? 'animate' : 'initial'}
              variants={textRevealVariants}
              className={`transition-opacity duration-500 mb-6 ${
                typingComplete > index ? 'opacity-100' : 'opacity-0'
              }`}>
              <h3 className="text-lg font-bold font-playfair text-gray-800 mb-2">
                {index + 1}. {point.title}
              </h3>
              <p className="text-gray-700 font-inter">
                {typeof point.content === 'object'
                  ? JSON.stringify(point.content)
                  : point.content}
              </p>
            </motion.div>
          ))}
      </div>

      {typingComplete >=
        (Array.isArray(analysisPoints) ? analysisPoints.length : 0) && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={textRevealVariants}
          className="mt-4">
          <h3 className="text-lg font-bold font-playfair text-gray-800 mb-3">
            Recommended Styles
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(recommendedStyles) &&
              recommendedStyles.map((style, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#84a59d]/10 text-[#84a59d] rounded-full text-sm">
                  {style}
                </span>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
