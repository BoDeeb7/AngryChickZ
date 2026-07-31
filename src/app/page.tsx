
import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';

/**
 * CRITICAL: These settings ensure the page is never statically cached by Next.js.
 * By setting dynamic to 'force-dynamic', we ensure that every visitor sees the
 * latest Firestore data synced across all devices globally.
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
