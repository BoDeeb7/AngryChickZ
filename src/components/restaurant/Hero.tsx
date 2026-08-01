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

  const reviewsRef = useMemo(() => {
    if (!db) return null;
    return collection(db, 'reviews');
  }, [db]);
  const { data: reviews = [], loading: reviewsLoading } = useCollection<Review>(reviewsRef);
  
  const heroSettingsRef = useMemo(() => {
    if (!db) return null;
    return doc(db, 'settings', 'hero');
  }, [db]);
  const { data: heroSettings } = useDoc<any>(heroSettingsRef);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '4.9';
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bgImage = heroSettings?.bgImage || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop";
  const bannerImage = heroSettings?.bannerImage || bgImage;
  const bannerHeadline = heroSettings?.bannerHeadline || "LEVEL 5 HEAT";
  const bannerText = heroSettings?.bannerText || "Elite Signature Release";

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden w-full">
      <div className="absolute inset-0 z-0">
        <Image 
          src={bgImage} 
          alt="Gourmet Feast" 
          fill 
          className="object-cover opacity-40 md:opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-background" />
      </div>
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full">
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-left-4 duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-black/50 backdrop-blur-md border border-amber-500/20 text-amber-500 font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] shadow-xl">
            <Trophy className="h-3 w-3 md:h-4 md:w-4" /> Global Heat Record
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-[80px] font-black leading-[1.1] md:leading-[0.95] tracking-tighter text-white uppercase italic drop-shadow-2xl">
            Crave The <span className="text-primary">Heat.</span> <br className="hidden sm:block" />
            Taste The <span className="text-secondary">Perfection.</span>
          </h1>
          
          <p className="text-base md:text-xl text-white/70 max-w-lg leading-relaxed font-medium">
            Triple-crunch gourmet chicken redefined. Hand-brined for 24 hours, seasoned for an elite crunch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="h-16 md:h-24 px-8 md:px-12 rounded-2xl md:rounded-[2.5rem] bg-primary hover:bg-primary/90 text-white text-lg md:text-2xl font-black transition-all shadow-xl group uppercase italic" 
              onClick={scrollToMenu}
            >
              Order Now <ArrowRight className="ml-3 h-5 w-5 md:h-8 md:w-8 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 md:h-24 px-8 md:px-12 rounded-2xl md:rounded-[2.5rem] text-lg md:text-2xl font-black border-white/20 text-white hover:bg-white/5 uppercase italic backdrop-blur-sm" 
              onClick={scrollToMenu}
            >
              Explore Menu
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-6 md:pt-12 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 w-8 md:h-12 md:w-12 rounded-full border-2 border-primary bg-zinc-900 overflow-hidden flex items-center justify-center">
                    <Flame className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                ))}
              </div>
              <div className="min-w-[120px]">
                {reviewsLoading ? (
                  <Skeleton className="h-4 w-24 bg-white/10 rounded-full" />
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-2.5 w-2.5 md:h-3.5 md:w-3.5 ${i <= Math.round(Number(averageRating)) ? 'fill-secondary text-secondary' : 'text-white/20'}`} />)}
                    </div>
                    <p className="text-[9px] md:text-[11px] font-black text-white/50 uppercase tracking-widest mt-1">
                      ⭐ {averageRating} / 5.0 Rating
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center items-center w-full animate-in zoom-in-95 duration-1000">
          <div className="absolute w-[100%] h-[100%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative w-full max-w-[320px] md:max-w-[600px] aspect-square transition-transform duration-700 hover:scale-105">
            <Image 
              src={bannerImage} 
              alt="Angry Inferno Promo" 
              fill 
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          <div className="absolute -top-4 right-0 md:-top-10 md:-right-5 bg-black/70 backdrop-blur-xl p-5 md:p-10 rounded-2xl md:rounded-[3rem] rotate-6 border border-primary/20 shadow-2xl scale-90 md:scale-100">
            <p className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-1 md:mb-3">{bannerText}</p>
            <p className="text-xl md:text-4xl font-black text-white uppercase italic tracking-tighter">{bannerHeadline}</p>
            <div className="flex gap-0.5 mt-2">
              {[1,2,3,4,5].map(i => <Flame key={i} className="h-3 w-3 md:h-6 md:w-6 fill-primary text-primary" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
