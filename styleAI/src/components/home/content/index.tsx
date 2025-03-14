'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CircularGallery from '@/components/WelcomePage/CircularGallery';

// 定义示例图片数据
const galleryItems = [
  { image: '/gallery/outfit1.png', text: 'Casual Style' },
  { image: '/gallery/outfit2.png', text: 'Formal Wear' },
  { image: '/gallery/outfit3.png', text: 'Street Fashion' },
  { image: '/gallery/outfit3.png', text: 'Business Casual' },
  { image: '/gallery/outfit1.png', text: 'Evening Elegance' },
  { image: '/gallery/outfit2.png', text: 'Summer Vibes' },
];

export function Hero() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/personalized-recommendation/step1');
  };

  return (
    <main className="bg-white min-h-screen pt-20">
      <div className="container mx-auto px-4 py-16 max-w-6xl text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2D4B37] mb-8 leading-tight">
            Generate your outfits
            <br />
            Using <span className="text-[#FF9999]">STYLE-AI</span>
          </h1>
          <button
            className="bg-black text-white px-12 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors"
            onClick={handleStartClick}>
            Start
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 px-0 md:px-8">
          <div style={{ height: '600px', position: 'relative' }}>
            <CircularGallery
              items={galleryItems}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
              font="bold 24px 'Playfair Display'"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
