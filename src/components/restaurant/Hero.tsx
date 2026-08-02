
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export function Hero() {
  const db = useFirestore();
  const heroSettingsRef = useMemo(() => db ? doc(db, 'settings', 'hero') : null, [db]);
  const { data: heroSettings } = useDoc<any>(heroSettingsRef);

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
  };

  const bgImage = heroSettings?.bgImage || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop";
  const bannerImage = heroSettings?.bannerImage || bgImage;

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 overflow-hidden w-full bg-zinc-950">
      <div className="absolute inset-0 z-0">
        <Image 
          src={bgImage} 
          alt="Background" 
          fill 
          className="object-cover opacity-50 animate-gpu"
          priority
          sizes="100vw"
          quality={60}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-background" />
      </div>
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 border border-amber-500/30 text-amber-500 font-black text-[10px] uppercase tracking-widest backdrop-blur-md">
            <Trophy className="h-3 w-3" /> #1 Premium Fried Chicken
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black leading-tight text-white uppercase italic tracking-tighter">
            Crave The <span className="text-primary">Heat.</span> <br />
            Taste The <span className="text-secondary">Gold.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/80 max-w-xl font-medium leading-relaxed">
            Gourmet chicken redefined. 24-hour brine, signature spice blend, and an elite crunch you won't forget.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic text-xl shadow-2xl active:scale-95 transition-all" onClick={scrollToMenu}>
              Order Now <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 uppercase italic backdrop-blur-xl transition-all active:scale-95 shadow-2xl" onClick={scrollToMenu}>
              Explore Menu
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:flex justify-center items-center w-full">
          <div className="relative w-full max-w-[600px] aspect-square animate-in zoom-in duration-1000">
            <div className="absolute inset-0 bg-amber-500/20 blur-[120px] rounded-full animate-pulse" />
            <Image 
              src={bannerImage} 
              alt="Promo" 
              fill 
              className="object-contain drop-shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-gpu"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
