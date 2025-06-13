"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import CircularGallery from "@/components/ui/CircularGallery";
import BounceCards from "@/components/ui/BounceCards";
import LiquidChrome from "@/components/background/LiquidChrome";
import { useAuth, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { HeroScrollSection } from "@/components/home/hero-scroll-section";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

const images = [
  basePath + "/gallery/outfit1.png",
  basePath + "/gallery/outfit2.png",
  basePath + "/gallery/outfit3.png",
  basePath + "/gallery/outfit4.png",
  basePath + "/gallery/outfit5.png",
];

const galleryItems = [
  {
    video: basePath + "/gallery/model1.mp4",
    text: "Model 1",
  },
  {
    video: basePath + "/gallery/model2.mp4",
    text: "Model 2",
  },
  {
    video: basePath + "/gallery/model3.mp4",
    text: "Model 3",
  },
  {
    video: basePath + "/gallery/model4.mp4",
    text: "Model 4",
  },
];

const doubleDownPath = `${basePath}/doubledown.svg`;

const transformStyles = [
  "rotate(5deg) translate(-150px)",
  "rotate(0deg) translate(-70px)",
  "rotate(-5deg)",
  "rotate(5deg) translate(70px)",
  "rotate(-5deg) translate(150px)",
];

export function Hero() {
  const router = useRouter();
  const usecaseRef = useRef<HTMLDivElement>(null);
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
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
  /**
   * Handles the start button click for signed-in users
   * Initiates transition animation and navigates to algorithm gallery
   */
  const handleStartClick = () => {
    // Start transition animation
    setIsTransitioning(true);

    // Delay navigation to allow for animation
    setTimeout(() => {
      router.push("/algorithmGallery");
    }, 800);
  };

  const scrollToUsecase = () => {
    usecaseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToScrollSection = () => {
    scrollSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Allow scrolling within container but prevent body scrolling
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // Make sure the container can scroll
    if (containerRef.current) {
      containerRef.current.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="w-screen overflow-y-auto no-scrollbar"
      initial="initial"
      animate={isTransitioning ? "exit" : "animate"}
      variants={pageVariants}
      transition={{ duration: 0.5 }}>
      {/* Flowing Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-auto">
        <LiquidChrome
          baseColor={[0.9, 0.9, 0.9]}
          speed={0.2}
          amplitude={0.5}
          frequencyX={3}
          frequencyY={2}
          interactive={true}
        />
        <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
      </div>

      {/* Hero Section - First Screen */}
      <main className="w-screen flex justify-center items-center relative">
        <div className="w-[100%] mt-[15vh] flex flex-col justify-center rounded-xl">
          {/* Title */}
          <div className="w-[100%] mb-8 text-center font-playfair">
            <motion.h1
              className="text-[#000000] text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold block"
              variants={itemVariants}>
              Generate your best fit outfits
            </motion.h1>
            <div className="flex justify-center items-baseline">
              <motion.h1
                className="text-[#000000] text-2xl sm:text-3xl md:text-3xl lg:text-5xl xl:text-5xl font-medium mr-2"
                variants={itemVariants}>
                Using{" "}
              </motion.h1>
              <motion.h1
                className="text-[#FF9999] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold"
                variants={itemVariants}>
                STYLE-AI
              </motion.h1>
            </div>
          </div>
          {/* Bounce Cards */}
          <div className="w-[100%] flex justify-center items-center mb-10">
            <BounceCards
              className="custom-bounceCards"
              images={images}
              containerWidth={500}
              containerHeight={250}
              animationDelay={1}
              animationStagger={0.08}
              easeType="elastic.out(1, 0.5)"
              transformStyles={transformStyles}
              enableHover={true}
            />
          </div>
          {/* <motion.p
            className="text-[#333333] font-light text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto mt-6 px-4"
            variants={itemVariants}>
            StyleAI harnesses cutting‑edge artificial intelligence to deliver
            bespoke, head‑to‑toe styling recommendations—hairstyles, outfits,
            and more. Simply snap a photo of yourself to unlock your
            personalized fashion blueprint.
          </motion.p> */}

          {/* Scroll Animation Section */}

          <HeroScrollSection />

          {/* Scroll Down Button - Positioned at bottom */}
          {/* <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <div
              className="flex flex-col justify-around items-center cursor-pointer group"
              onClick={scrollToScrollSection}>
              <p className="text-[#2D4B37] font-medium mb-4 transition-all group-hover:text-[#FF9999]">
                More details
              </p>
              <div className="animate-bounce transition-transform group-hover:scale-110">
                <Image
                  src={doubleDownPath}
                  alt="Scroll Down"
                  width={40}
                  height={40}
                  className="transition-all group-hover:opacity-80"
                />
              </div>
            </div>
          </div> */}
          {/* Usecase Section - Last Screen */}
          <section ref={usecaseRef} className="w-full h-screen flex">
            <div className="w-[100%] flex flex-col translate-y-[5%] rounded-md gap-10">
              {/* Title */}
              <div className="w-[100%] flex flex-col justify-center items-center">
                <h2 className="p-5 text-center text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl font-bold text-[#2D4B37]">
                  Use Cases
                </h2>
              </div>
              <div className="w-[100%] flex flex-col justify-center items-center">
                <p className="text-center w-[50%] text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl text-gray-600">
                  Browse through our collection of fashion styles and find
                  inspiration for your next outfit. Our AI will help you create
                  personalized recommendations based on your preferences.
                </p>
              </div>
              {/* Circular Gallery */}
              <div className="w-[100%] h-[50%] flex top-0">
                <CircularGallery
                  items={galleryItems}
                  bend={2}
                  textColor="transparent"
                  borderRadius={0.05}
                  font="0px var(--font-playfair)"
                />
              </div>
              {/* Start/Sign In Button */}
              {/* <div className="w-[100%] h-[10%] flex justify-center items-center mb-5">
                <SignedIn>
                  <button
                    onClick={handleStartClick}
                    className="px-6 py-2.5 bg-[#2D4B37] text-white rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-sm sm:text-base">
                    Start
                  </button>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-6 py-2.5 bg-[#2D4B37] text-white rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-sm sm:text-base">
                      Try it now!
                    </button>
                  </SignInButton>
                </SignedOut>
              </div> */}
            </div>
          </section>
          {/* Start/Sign In Button */}
          <div className="w-[100%] flex justify-center items-center">
            <SignedIn>
              <button
                onClick={handleStartClick}
                className="w-[120px] py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm sm:text-base">
                Start
              </button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-[160px] py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm sm:text-base">
                  Start
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
