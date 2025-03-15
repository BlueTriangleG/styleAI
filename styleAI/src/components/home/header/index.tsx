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
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-[#2D4B37] font-playfair">
          Style-AI
        </Link>

        {/* Login Button */}
        <button
          onClick={handleLoginClick}
          className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors transform hover:-translate-y-0.5 font-inter">
          Login
        </button>
      </div>
    </header>
  );
}
