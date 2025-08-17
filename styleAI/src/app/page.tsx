import Image from 'next/image';
import { Header } from '@/components/home/header';
import { Hero } from '@/components/home/content';
import { Footer } from '@/components/home/footer';

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
export default function Home() {
  return (
    <ClerkProvider>
      <div>
        <Header />
        <Hero />
        <Footer />
      </div>
    </ClerkProvider>
  );
}
