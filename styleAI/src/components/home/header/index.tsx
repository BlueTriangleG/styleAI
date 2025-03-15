'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xs shadow-sm z-50">
      <div className="w-screen mx-auto px-8 md:px-16 py-3 flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-[#2D4B37]">
            Style-AI
          </Link>
        </div>

        {/* Right side - Buttons */}
        <div className="flex items-center gap-4">
          
          <button
            onClick={handleLoginClick}
            className="bg-transparent text-[#2D4B37] border border-[#2D4B37] px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
