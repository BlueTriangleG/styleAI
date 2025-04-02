'use client';

import { BasicTiltCard, TiltSpotlight } from '@/components/ui/tilt-cards';
import { Header } from '@/components/home/header';

/**
 * UI Showcase page displaying various UI components
 * Used for demonstration and testing of UI components
 */
export default function UIShowcase() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-center font-playfair">
            UI Components Showcase
          </h1>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
              Tilt Components
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              These components use mouse interaction to create dynamic 3D tilt
              effects, enhancing user interaction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">Basic Tilt Card</h3>
                <BasicTiltCard />
              </div>

              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">
                  Tilt with Spotlight
                </h3>
                <TiltSpotlight />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Implementation Notes</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Tilt components use Framer Motion for smooth animations</li>
              <li>
                Effects can be customized with different rotation factors and
                spring options
              </li>
              <li>
                Spotlight effect creates a dynamic glow that follows cursor
                movement
              </li>
              <li>
                Both components maintain performance through optimized rendering
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
