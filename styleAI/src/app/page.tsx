import Image from "next/image";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/content";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function Home() {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-[#E6F4EA]">
        <Header />
        <Hero />
      </div>
    </ClerkProvider>
  );
}
