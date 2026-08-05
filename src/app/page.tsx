import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';
import { FloatingCart } from '@/components/restaurant/FloatingCart';

/**
 * CRITICAL: These settings ensure the page is never statically cached.
 * This guarantees real-time cross-device data synchronization.
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
      {/* The Floating Cart is explicitly placed here so it only appears on the visitor menu */}
      <FloatingCart />
    </div>
  );
}
