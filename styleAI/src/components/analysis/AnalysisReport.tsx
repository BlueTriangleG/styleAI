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
  rawAnalysisData?: any; // 原始分析数据
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
  rawAnalysisData,
}) => {
  // Helper function to safely get nested values
  const getNestedValue = (obj: any, path: string[]): string => {
    try {
      let current = obj;
      for (const key of path) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          return 'Not specified';
        }
      }
      return typeof current === 'string' ? current : 'Not specified';
    } catch (error) {
      return 'Not specified';
    }
  };
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
      className="flex flex-col h-full"
      initial="initial"
      animate="animate"
      variants={contentVariants}
    >
      {/* Data source info */}
      <div className="text-sm text-gray-500 mb-4">
        Data source: {jobId ? `API (JobID: ${jobId})` : 'Local storage'}
      </div>

      <div className="flex-1 min-h-0 pr-2">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#84a59d]/40 scrollbar-track-[#84a59d]/10 space-y-6">
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

        {/* Detailed Analysis Section from Database */}
        {(rawAnalysisData || analysisPoints.length > 0) && (
          <motion.div
            className="mt-8 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg shadow-sm border border-blue-100"
            variants={contentVariants}
          >
            <h4 className="font-bold text-gray-800 mb-6 font-playfair text-xl border-b border-blue-200 pb-3">
              Complete Analysis Report
            </h4>
            
            {/* Key Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/70 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Gender & Age</h5>
                <p className="text-gray-700 font-inter">
                  {rawAnalysisData ? 
                    `${getNestedValue(rawAnalysisData, ['Semantic Features', 'Intrinsic Features', 'Gender'])} • ${getNestedValue(rawAnalysisData, ['Semantic Features', 'Intrinsic Features', 'Age Range Visual Estimation'])}` :
                    'Analysis in progress...'
                  }
                </p>
              </div>
              <div className="bg-white/70 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Face Shape</h5>
                <p className="text-gray-700 font-inter">
                  {rawAnalysisData ? 
                    getNestedValue(rawAnalysisData, ['Structural Features', 'Facial Features', 'Face Shape and Visual Outline']) :
                    'Analyzing facial structure...'
                  }
                </p>
              </div>
              <div className="bg-white/70 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Body Type</h5>
                <p className="text-gray-700 font-inter">
                  {rawAnalysisData ? 
                    getNestedValue(rawAnalysisData, ['Structural Features', 'Body Features', 'Body Type and Curve Characteristics']) :
                    'Determining body characteristics...'
                  }
                </p>
              </div>
              <div className="bg-white/70 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Style Impression</h5>
                <p className="text-gray-700 font-inter">
                  {rawAnalysisData ? 
                    getNestedValue(rawAnalysisData, ['Semantic Features', 'Temperament Features', 'Overall Style First Impression']) :
                    'Generating style insights...'
                  }
                </p>
              </div>
            </div>

            {/* Color Analysis */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-800 mb-3 font-playfair text-lg">Color Analysis</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 p-4 rounded-lg">
                  <h6 className="font-medium text-gray-700 mb-2">Skin Tone</h6>
                  <p className="text-gray-600 text-sm">
                    {rawAnalysisData ? 
                      getNestedValue(rawAnalysisData, ['Color Features', 'Skin Tone and Visual Characteristics']) :
                      'Analyzing skin tone characteristics...'
                    }
                  </p>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <h6 className="font-medium text-gray-700 mb-2">Hair Color</h6>
                  <p className="text-gray-600 text-sm">
                    {rawAnalysisData ? 
                      getNestedValue(rawAnalysisData, ['Color Features', 'Hair Color and Saturation']) :
                      'Processing hair color analysis...'
                    }
                  </p>
                </div>
              </div>
              <div className="mt-3 bg-white/50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-700 mb-2">Recommended Colors</h6>
                <p className="text-gray-600 text-sm">
                  {rawAnalysisData ? 
                    getNestedValue(rawAnalysisData, ['Color Features', 'Clothing Color Optimization Suggestions']) :
                    'Generating personalized color recommendations...'
                  }
                </p>
              </div>
            </div>

            {/* Style Optimization */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3 font-playfair text-lg">Style Optimization</h5>
              <p className="text-gray-600 leading-relaxed">
                {rawAnalysisData ? 
                  getNestedValue(rawAnalysisData, ['Semantic Features', 'Temperament Features', 'Style Optimization and Temperament Enhancement Suggestions']) :
                  'Creating personalized style enhancement recommendations based on your unique features and preferences...'
                }
              </p>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </motion.div>
  );
};