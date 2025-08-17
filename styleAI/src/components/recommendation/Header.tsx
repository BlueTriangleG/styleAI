'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { ClipboardIcon } from '@radix-ui/react-icons';

export function RecommendationHeader() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/algorithmGallery');
  };

  return (
    <header className="fixed top-0 left-0 right-0 backdrop-blur-sm z-50">
      <div className="w-full px-6 md:px-12 py-4 flex items-center justify-between">
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
            <Link
              href="/checkout/embedded/quickstart"
              className="bg-white text-[#2D4B37] border border-[#2D4B37] px-6 py-2.5 rounded-md font-medium hover:bg-gray-50 transition-colors shadow-sm text-base flex items-center">
              <span className="mr-1">💎</span> Subscribe
            </Link>
            <button
              onClick={handleStartClick}
              className="bg-[#2D4B37] text-white px-6 py-2.5 rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-base">
              Start
            </button>
            <div className="ml-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-[42px] h-[42px]',
                  },
                }}>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Report History"
                    labelIcon={<ClipboardIcon />}
                    onClick={() => router.push('/reportHistory')}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </SignedIn>

          <SignedOut>
            {/* Only shown when user is signed out */}
            <Link
              href="/checkout/embedded/quickstart"
              className="bg-white text-[#2D4B37] border border-[#2D4B37] px-6 py-2.5 rounded-md font-medium hover:bg-gray-50 transition-colors shadow-sm text-base flex items-center">
              <span className="mr-1">💎</span> Subscribe
            </Link>
            <SignInButton mode="modal">
              <button className="bg-[#2D4B37] text-white px-6 py-2.5 rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-base">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-white text-[#2D4B37] border border-[#2D4B37] px-6 py-2.5 rounded-md font-medium hover:bg-gray-50 transition-colors shadow-sm text-base">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
