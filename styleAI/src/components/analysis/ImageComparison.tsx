import Image from 'next/image';
import { motion } from 'framer-motion';

interface ImageComparisonProps {
  userImage: string | null;
  bestFitImage: string | null;
  isPageLoading: boolean;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  userImage,
  bestFitImage,
  isPageLoading,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* 左侧：用户图像 */}
      <div className="w-full h-1/2 md:w-1/3 relative">
        <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md">
          {userImage ? (
            <Image
              src={userImage}
              alt="Your uploaded image"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-inter">Your Image</span>
            </div>
          )}
        </div>
      </div>

      {/* 箭头 */}
      <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 中间图片 - 最佳匹配图片 */}
      <div className="w-full h-1/2 md:w-1/3 relative">
        <div className="aspect-[3/4] h-[50vh] rounded-lg overflow-hidden border-2 border-blue-400 shadow-lg">
          {isPageLoading ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
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
                <span className="text-gray-500 font-inter">加载中...</span>
              </div>
            </div>
          ) : bestFitImage ? (
            <Image
              src={bestFitImage}
              alt="Best fit style"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-inter">
                正在生成最佳匹配图片...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};