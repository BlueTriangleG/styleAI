'use client';
import React, { useRef } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div
      className="min-h-[45rem] w-full flex justify-center relative px-2 sm:px-4 md:px-6 py-4 mt-4 sm:mt-6 md:mt-10 mx-auto max-w-screen-2xl"
      ref={containerRef}>
      <div
        className="py-4 sm:py-6 md:py-10 w-full relative"
        style={{
          perspective: '700px',
        }}>
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="w-full max-w-5xl mx-auto text-center px-2 sm:px-4">
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
      }}
      className="max-w-7xl -mt-6 sm:-mt-8 md:-mt-12 mx-auto h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[75vh] w-full backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-filter">
      <div className="h-full w-full overflow-hidden rounded-md sm:rounded-lg md:rounded-xl bg-transparent">
        {children}
      </div>
    </motion.div>
  );
};
