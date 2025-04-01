'use client';

import { Tilt } from '@/components/ui/tilt';
import { Spotlight } from '@/components/ui/spotlight';

/**
 * A basic card component with tilt effect
 * Displays an image with title and subtitle in a tilting card
 */
export function BasicTiltCard() {
  return (
    <Tilt rotationFactor={8} isRevese>
      <div
        style={{
          borderRadius: '12px',
        }}
        className="flex max-w-[270px] flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900">
        <img
          src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
          alt="Cyberpunk city at night"
          className="h-48 w-full object-cover"
        />
        <div className="p-2">
          <h1 className="font-mono leading-snug text-zinc-950 dark:text-zinc-50">
            Neon Dreams
          </h1>
          <p className="text-zinc-700 dark:text-zinc-400">Cyberpunk 2077</p>
        </div>
      </div>
    </Tilt>
  );
}

/**
 * A combination of Tilt and Spotlight effects
 * Creates a card with tilt effect and spotlight glow that follows cursor
 */
export function TiltSpotlight() {
  return (
    <div className="aspect-video max-w-sm">
      <Tilt
        rotationFactor={6}
        isRevese
        style={{
          transformOrigin: 'center center',
        }}
        springOptions={{
          stiffness: 26.7,
          damping: 4.1,
          mass: 0.2,
        }}
        className="group relative rounded-lg">
        <Spotlight
          className="z-10 from-white/50 via-white/20 to-white/10 blur-2xl"
          size={248}
          springOptions={{
            stiffness: 26.7,
            damping: 4.1,
            mass: 0.2,
          }}
        />
        <img
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80"
          alt="Minimalist space scene"
          className="h-32 w-full rounded-lg object-cover grayscale duration-700 group-hover:grayscale-0"
        />
      </Tilt>
      <div className="flex flex-col space-y-0.5 pb-0 pt-3">
        <h3 className="font-mono text-sm font-medium text-zinc-500 dark:text-zinc-400">
          2001: A Space Odyssey
        </h3>
        <p className="text-sm text-black dark:text-white">Stanley Kubrick</p>
      </div>
    </div>
  );
}
