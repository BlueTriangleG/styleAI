"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecommendationHeader } from "@/components/recommendation/Header";
import { motion } from "framer-motion";
import LiquidChrome from "@/components/Background/LiquidChrome";
import { UploadImageComponent } from "@/components/uploadImage/UploadImageComponent";

/**
 * Upload Images page component
 *
 * Allows users to upload or capture images, apply face detection,
 * and move on to the next stage in the styling process
 */
export default function UploadImages() {
  const [image, setImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  /**
   * Handle next button click to proceed to next stage
   */
  const handleNextClick = () => {
    if (image) {
      // Store the image in session storage or state management
      if (typeof window !== "undefined") {
        try {
          // Clear previous data
          sessionStorage.removeItem("userImage");
          // Store new image data
          sessionStorage.setItem("userImage", image);
          console.log("Image successfully stored in sessionStorage");
        } catch (error) {
          console.error("Error storing image to sessionStorage:", error);
        }
      }

      // Start transition animation
      setIsTransitioning(true);

      // Extended animation time to ensure sufficient transition time
      setTimeout(() => {
        // Use replace instead of push to avoid browser history issues
        router.replace("/getBestFitCloth/loading");
      }, 800);
    } else {
      // Show alert if no image is available
      alert("Please upload or take a photo first");
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <RecommendationHeader />
      <motion.div
        className="min-h-screen pt-20 relative"
        initial="initial"
        animate={isTransitioning ? "exit" : "animate"}
        variants={pageVariants}
        transition={{ duration: 0.5 }}>
        {/* Fluid background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <LiquidChrome
            baseColor={[0.9, 0.9, 0.9]}
            speed={0.2}
            amplitude={0.5}
            frequencyX={3}
            frequencyY={2}
            interactive={true}
          />
          {/* Semi-transparent overlay layer */}
          <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
        </div>

        {/* Content area */}
        <div className="container mx-auto px-4 py-6 relative z-10">
          <motion.h1
            className="text-4xl font-bold mb-10 text-left font-playfair"
            variants={itemVariants}>
            Upload Your Photo
          </motion.h1>

          <div
            className="flex flex-col md:flex-row gap-8"
            style={{ minHeight: "calc(100vh - 200px)" }}>
            {/* Left side - Upload area - Using the extracted component */}
            <UploadImageComponent
              image={image}
              setImage={setImage}
              containerVariants={containerVariants}
            />

            {/* Right side - Instructions */}
            <motion.div
              className="w-full md:w-1/2 flex flex-col"
              variants={containerVariants}>
              <motion.div
                className="bg-white/40 backdrop-blur-xs rounded-lg flex-grow shadow-sm p-8 border border-white/20"
                variants={itemVariants}>
                <div className="text-gray-700 space-y-6">
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h2 className="text-xl font-bold font-playfair text-gray-800 mb-2">
                      Upload a Clear Picture:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 font-inter">
                      <li>Use a half or full body shot.</li>
                      <li>Preferably choose a front view.</li>
                    </ul>
                  </motion.div>

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h2 className="text-xl font-bold font-playfair text-gray-800 mb-2">
                      Ensure Your Face is Visible:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 font-inter">
                      <li>Wear clothes that do not obscure your face.</li>
                      <li>
                        Avoid overly loose clothing that might cover your
                        features.
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h2 className="text-xl font-bold font-playfair text-gray-800 mb-2">
                      Review Your Picture:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 font-inter">
                      <li>
                        Confirm that the image is clear and meets the
                        guidelines.
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h2 className="text-xl font-bold font-playfair text-gray-800 mb-2">
                      Proceed to the Next Stage:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 font-inter">
                      <li>
                        Once you're satisfied with your picture, click "Next
                        Stage."
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </motion.div>

              <motion.button
                onClick={handleNextClick}
                disabled={!image}
                className={`w-full py-3 px-6 rounded-md text-white font-medium mt-6 shadow-md font-inter ${
                  image
                    ? "bg-[#84a59d] hover:bg-[#6b8c85]"
                    : "bg-gray-300 cursor-not-allowed"
                } transition-colors`}
                variants={itemVariants}
                whileHover={image ? { scale: 1.05 } : {}}
                whileTap={image ? { scale: 0.95 } : {}}>
                Next Stage
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
