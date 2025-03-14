'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function RecommendationHeader() {
  const router = useRouter();

  const handleAvatarClick = () => {
    router.push('/settings');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/1 backdrop-blur-xs shadow-sm z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#2D4B37]">
          Style-AI
        </Link>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-gray-200 cursor-pointer overflow-hidden relative"
          onClick={handleAvatarClick}>
          {/* Default avatar icon */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          {/* You can replace this with an actual user avatar if available */}
          {/* <Image 
            src="/path-to-user-avatar.jpg" 
            alt="User Avatar" 
            fill
            className="object-cover"
          /> */}
        </div>
      </div>
    </header>
  );
}
