'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs';

export function Header() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/personalized-recommendation/step1');
  };

  return (
    <header className="w-screen h-16 fixed top-0 left-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="w-[100%] h-[100%] flex items-center justify-between px-10">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-[#2D4B37] font-playfair hover:text-[#1F3526] transition-colors">
            Style-AI
          </Link>
        </div>

        {/* Right side - Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            {/* Only shown when user is signed in */}
            <button
              onClick={handleStartClick}
              className="bg-[#2D4B37] text-white px-4 py-2 rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-base">
              Start
            </button>
            <div className="ml-3">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            {/* Only shown when user is signed out */}
            <SignInButton mode="modal">
              <button className="bg-[#2D4B37] text-white border border-[#2D4B37] px-4 py-2 rounded-md font-medium hover:bg-[#1F3526]">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-white text-[#2D4B37] border border-[#2D4B37] px-4 py-2 rounded-md font-medium hover:bg-gray-50">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
