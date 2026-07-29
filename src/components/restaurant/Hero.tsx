'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Flame, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Review } from '@/types/restaurant';

export function Hero() {
  const db = useFirestore();
  const reviewsRef = useMemo(() => db ? collection(db, 'reviews') : null, [db]);
  const { data: reviews = [] } = useCollection<Review>(reviewsRef);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 4.9;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-40 overflow-hidden ambient-glow mesh-transition w-full max-w-full">
      {/* Optimized Orbs - contained to prevent horizontal scroll */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[100px] md:blur-[150px] rounded-full animate-glow-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[100px] md:blur-[150px] rounded-full animate-glow-slow delay-700 pointer-events-none" />

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full max-w-full overflow-hidden lg:overflow-visible">
        <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-card/50 backdrop-blur-md border border-primary/10 text-primary font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] shadow-sm">
            <Trophy className="h-4 w-4" /> Global Heat Record
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-[90px] font-black leading-[1] md:leading-[0.95] tracking-tighter text-foreground uppercase italic">
            Crave The <span className="text-primary drop-shadow-[0_0_15px_rgba(225,29,72,0.3)]">Heat.</span> <br className="hidden sm:block" />
            Taste The <span className="text-secondary drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">Perfection.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 max-w-lg leading-relaxed font-medium">
            Triple-crunch gourmet chicken redefined. Hand-brined for 24 hours, seasoned for an elite crunch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <Button 
              size="lg" 
              className="h-20 md:h-24 px-8 md:px-12 rounded-[2rem] md:rounded-[2.5rem] bg-primary hover:bg-primary/90 text-white text-xl md:text-2xl font-black transition-all shadow-xl group uppercase italic" 
              onClick={scrollToMenu}
            >
              Order Now <ArrowRight className="ml-3 md:ml-4 h-6 w-6 md:h-8 md:w-8 group-hover:translate-x-3 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-20 md:h-24 px-8 md:px-12 rounded-[2rem] md:rounded-[2.5rem] text-xl md:text-2xl font-black border-primary/10 hover:bg-primary/5 uppercase italic backdrop-blur-sm" 
              onClick={scrollToMenu}
            >
              Explore Menu
            </Button>
          </div>

          <div className="flex items-center gap-8 md:gap-12 pt-8 md:pt-12 border-t border-primary/5">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="flex -space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <Image src={`https://picsum.photos/seed/${i + 80}/48/48`} alt="user" width={48} height={48} className="object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-3 w-3 md:h-3.5 md:w-3.5 ${i <= Math.round(Number(averageRating)) ? 'fill-secondary text-secondary' : 'text-foreground/10'}`} />)}
                </div>
                <p className="text-[10px] md:text-[11px] font-black text-foreground/40 uppercase tracking-widest mt-1.5">
                  ⭐ {averageRating} / 5.0 Sentiment
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center items-center animate-in fade-in zoom-in-90 duration-1000 delay-300 w-full">
          <div className="absolute w-[120%] h-[120%] bg-primary/5 blur-[80px] md:blur-[120px] rounded-full animate-pulse pointer-events-none" />
          <div className="relative w-full max-w-[400px] md:max-w-[600px] aspect-square transition-transform duration-1000 hover:rotate-2">
            <Image 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop" 
              alt="Angry Inferno Burger" 
              fill 
              className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.3)]"
              priority
            />
          </div>
          
          <div className="absolute -top-4 -right-2 md:-top-10 md:-right-5 glass-card p-6 md:p-10 rounded-2xl md:rounded-[3rem] rotate-12 border-primary/10 shadow-2xl scale-75 md:scale-100">
            <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-2 md:mb-3">Elite Signature</p>
            <p className="text-2xl md:text-4xl font-black text-foreground uppercase italic tracking-tighter">LEVEL 5 HEAT</p>
            <div className="flex gap-1 mt-3">
              {[1,2,3,4,5].map(i => <Flame key={i} className="h-4 w-4 md:h-6 md:w-6 fill-primary text-primary" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
