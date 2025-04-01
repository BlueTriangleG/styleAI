'use client';

import Link from 'next/link';
import styles from './index.module.scss';
import { useRouter } from 'next/navigation';
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs';
import { DotIcon } from '@radix-ui/react-icons';
import SettingsPage from '@/app/settings/page';
export function Header() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/algorithmGallery');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
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
              className="bg-[#2D4B37] text-white px-6 py-2.5 rounded-md font-medium hover:bg-[#1F3526] transition-colors shadow-sm text-base">
              Start
            </button>
            <div className="ml-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-12 h-12',
                  },
                }}>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Report History"
                    labelIcon={<DotIcon />}
                    onClick={() => router.push('/reportHistory')}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </SignedIn>

          <SignedOut>
            {/* Only shown when user is signed out */}
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
