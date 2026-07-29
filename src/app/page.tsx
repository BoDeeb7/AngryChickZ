import { Navbar } from '@/components/restaurant/Navbar';
import { Hero } from '@/components/restaurant/Hero';
import { MenuGrid } from '@/components/restaurant/MenuGrid';
import { Footer } from '@/components/restaurant/Footer';

// Ensure the page is never statically cached to show real-time Firestore data
// These must be exported from a Server Component, not a Client Component.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen selection:bg-primary selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <MenuGrid />
      </main>
      <Footer />
    </div>
  );
}
