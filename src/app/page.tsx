import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';
import { FloatingCart } from '@/components/restaurant/FloatingCart';

/**
 * Main Application Home Page
 * 1. Server-side segment configuration for dynamic data.
 * 2. Scopes the FloatingCart exclusively to the visitor view.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen selection:bg-primary selection:text-white bg-zinc-950">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <MenuGrid />
      </main>
      <Footer />
      {/* 
        The Floating Cart is rendered here to ensure it only appears 
        on the Home page and never in the Admin dashboard.
      */}
      <FloatingCart />
    </div>
  );
}
