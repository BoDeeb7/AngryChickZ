'use client';

import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';
import { FloatingCart } from '@/components/restaurant/FloatingCart';

/**
 * Main Application Home Page
 * Converted to pure Client Component to eliminate server-side blocking latency.
 */
export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen selection:bg-primary selection:text-white bg-zinc-950">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <MenuGrid />
      </main>
      <Footer />
      <FloatingCart />
    </div>
  );
}
