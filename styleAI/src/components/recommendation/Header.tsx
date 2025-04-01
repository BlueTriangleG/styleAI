'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { ClipboardIcon } from '@radix-ui/react-icons';

export function RecommendationHeader() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-[#2D4B37] font-playfair hover:text-[#1F3526] transition-colors">
          Style-AI
        </Link>

        {/* User Menu */}
        <div className="flex items-center">
          <SignedIn>
            {/* User Button */}
            <div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-12 h-12',
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
            {/* Sign In Button for non-authenticated users */}
            <SignInButton mode="modal">
              <button className="bg-[#2D4B37] text-white px-6 py-2.5 rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-base">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
