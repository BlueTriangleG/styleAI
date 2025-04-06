"use client";

import { Header } from "@/components/home/header";
import { HeroScrollSection } from "@/components/home/hero-scroll-section";

export default function HeroScrollShowcasePage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <HeroScrollSection />
        
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-6 text-[#2D4B37]">How to Use This Component</h2>
          
          <div className="space-y-6 text-gray-700">
            <p>
              The Hero Scroll component creates an engaging scroll animation that can be used at the top of landing pages.
              As users scroll, the component provides a dynamic 3D effect with rotating and scaling animations.
            </p>
            
            <h3 className="text-xl font-semibold mt-8 mb-2">Integration Steps:</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>Import the component: <code className="bg-gray-100 px-2 py-1 rounded">import {"{HeroScrollSection}"} from "@/components/home/hero-scroll-section";</code></li>
              <li>Add it to your page layout</li>
              <li>Customize the title text and image as needed</li>
              <li>Ensure you have sufficient vertical space for the scroll effect</li>
            </ol>
            
            <h3 className="text-xl font-semibold mt-8 mb-2">Key Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responsive design that adapts to mobile and desktop</li>
              <li>Smooth 3D perspective transformation on scroll</li>
              <li>Customizable title and content area</li>
              <li>High-quality image display with Next.js Image optimization</li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}