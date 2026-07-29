
'use client';

import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen selection:bg-red-600/30">
      {/* Dynamic Animated Background Layers */}
      <div className="fixed inset-0 overflow-hidden -z-10 bg-[#0F0F12]">
        <div className="ambient-orb w-[600px] h-[600px] bg-red-600 top-[-100px] left-[-100px] animate-orb" />
        <div className="ambient-orb w-[800px] h-[800px] bg-yellow-600 bottom-[-200px] right-[-200px] animate-orb [animation-delay:2s]" />
        <div className="ambient-orb w-[400px] h-[400px] bg-red-900 top-[20%] right-[10%] animate-orb [animation-delay:5s]" />
      </div>

      <Navbar />
      <main className="flex-grow pt-20">
        <Hero />
        <MenuGrid />
      </main>
      <Footer />
    </div>
  );
}
