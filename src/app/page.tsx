'use client';

import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/20 ambient-orb rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-yellow-600/10 ambient-orb rounded-full" />
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-red-900/10 ambient-orb rounded-full" />

      <Navbar />
      <main className="flex-grow">
        <Hero />
        <MenuGrid />
      </main>
      <Footer />
    </div>
  );
}