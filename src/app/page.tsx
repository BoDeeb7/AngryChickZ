
'use client';

import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="ambient-light w-[600px] h-[600px] bg-red-600 top-[-200px] left-[-100px]" />
        <div className="ambient-light w-[500px] h-[500px] bg-amber-600 bottom-[-100px] right-[-100px]" />
        <div className="ambient-light w-[400px] h-[400px] bg-red-800 top-[20%] right-[5%]" />
      </div>

      <Navbar />
      <main className="flex-grow">
        <Hero />
        <MenuGrid />
      </main>
      <Footer />
    </div>
  );
}
