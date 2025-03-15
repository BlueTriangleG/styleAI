"use client";


import Link from 'next/link';
import styles from "./index.module.scss";
import { useRouter } from 'next/navigation';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function Header() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleStartClick = () => {
    router.push('/personalized-recommendation/step1');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xs shadow-sm z-50">
      <div className="w-screen mx-auto px-8 md:px-16 py-3 flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-[#2D4B37] font-playfair">
            Style-AI
          </Link>
        </div>

        {/* Right side - Buttons */}
        <div className="flex items-center gap-4">

          <nav className={styles["nav-links"]}>
            <Link href="/dashboard">Dashboard</Link>
            
            <SignedIn>
              {/* Only shown when user is signed in */}
              <button
                onClick={handleStartClick}
                className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
                Start
              </button>
              <Link href="/settings"
                className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">Settings</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              {/* Only shown when user is signed out */}
              <SignInButton mode="modal">
                <button className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              
            </SignedOut>
          </nav>
        </div>
      </div>
    </header>
  );
}
