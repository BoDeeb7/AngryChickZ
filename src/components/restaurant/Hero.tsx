'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Flame, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Review } from '@/types/restaurant';
import { Skeleton } from '@/components/ui/skeleton';

export function Hero() {
  const db = useFirestore();

  const reviewsRef = useMemo(() => db ? collection(db, 'reviews') : null, [db]);
  const { data: reviews = [], loading: reviewsLoading } = useCollection<Review>(reviewsRef);
  
  const heroSettingsRef = useMemo(() => db ? doc(db, 'settings', 'hero') : null, [db]);
  const { data: heroSettings } = useDoc<any>(heroSettingsRef);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '4.9';
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
  };

  const bgImage = heroSettings?.bgImage || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop";
  const bannerImage = heroSettings?.bannerImage || bgImage;

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center pt-24 pb-20 overflow-hidden w-full">
      <div className="absolute inset-0 z-0">
        <Image 
          src={bgImage} 
          alt="Gourmet Feast" 
          fill 
          className="object-cover opacity-30 md:opacity-50"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-background" />
      </div>
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/50 border border-amber-500/20 text-amber-500 font-black text-[10px] uppercase tracking-widest">
            <Trophy className="h-3 w-3" /> Global Heat Record
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black leading-tight text-white uppercase italic">
            Crave The <span className="text-primary">Heat.</span> <br />
            Taste The <span className="text-secondary">Perfection.</span>
          </h1>
          
          <p className="text-base md:text-xl text-white/70 max-w-lg font-medium">
            Triple-crunch gourmet chicken redefined. Hand-brined for 24 hours, seasoned for an elite crunch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic text-lg" onClick={scrollToMenu}>
              Order Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/20 text-white hover:bg-white/5 uppercase italic" onClick={scrollToMenu}>
              Explore Menu
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:flex justify-center items-center w-full">
          <div className="relative w-full max-w-[500px] aspect-square">
            <Image 
              src={bannerImage} 
              alt="Promo" 
              fill 
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 0vw, 500px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}