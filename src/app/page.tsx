import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';

/**
 * CRITICAL: These settings ensure the page is never statically cached.
 * This guarantees that new items added on one device appear on others immediately.
 * In Next.js, these must be exported from a Server Component (no 'use client' at the top).
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
    </div>
  );
}
