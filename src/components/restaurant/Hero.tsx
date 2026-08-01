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
    <section className="relative min-h-[85vh] flex items-center pt-20 pb-20 overflow-hidden w-full bg-zinc-950">
      {/* Background with optimized loading */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={bgImage} 
          alt="Background" 
          fill 
          className="object-cover opacity-40 md:opacity-50 animate-gpu"
          priority
          sizes="100vw"
          quality={60}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background" />
      </div>
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/50 border border-amber-500/20 text-amber-500 font-black text-[10px] uppercase tracking-widest backdrop-blur-sm">
            <Trophy className="h-3 w-3" /> Global Heat Record
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black leading-tight text-white uppercase italic tracking-tighter">
            Crave The <span className="text-primary">Heat.</span> <br />
            Taste The <span className="text-secondary">Perfection.</span>
          </h1>
          
          <p className="text-base md:text-xl text-white/70 max-w-lg font-medium leading-relaxed">
            Triple-crunch gourmet chicken redefined. Hand-brined for 24 hours, seasoned for an elite crunch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic text-lg shadow-xl transition-all active:scale-95" onClick={scrollToMenu}>
              Order Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/10 text-white hover:bg-white/20 uppercase italic backdrop-blur-md transition-all active:scale-95 shadow-xl" onClick={scrollToMenu}>
              Explore Menu
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:flex justify-center items-center w-full">
          <div className="relative w-full max-w-[500px] aspect-square animate-in zoom-in duration-1000">
            <Image 
              src={bannerImage} 
              alt="Promo" 
              fill 
              className="object-contain drop-shadow-2xl animate-gpu"
              priority
              sizes="(max-width: 1024px) 0vw, 500px"
              quality={80}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
