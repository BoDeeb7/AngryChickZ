'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Flame, Trophy } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[95vh] flex items-center pt-32 pb-20 overflow-hidden bg-warm-glow">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10 relative z-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white shadow-sm border border-amber-500/10 text-amber-600 font-black text-[11px] uppercase tracking-[0.2em]">
            <Trophy className="h-4 w-4" /> Award Winning Flavors
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black leading-[1.05] tracking-tighter text-foreground uppercase italic">
            Crave The <span className="text-gradient-crimson">Heat.</span> <br />
            Taste The <span className="text-gradient-crimson">Perfection.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
            From our 24-hour brine to our secret triple-crunch coating, we redefine the gourmet fried chicken experience. Every bite is a celebration of spice and soul.
          </p>

          <div className="flex flex-wrap gap-5">
            <Button 
              size="lg" 
              className="h-20 px-10 rounded-[2rem] bg-primary hover:bg-primary/90 text-white text-xl font-black transition-all shadow-2xl hover:shadow-primary/40 group uppercase italic" 
              onClick={scrollToMenu}
            >
              Order Now <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-20 px-10 rounded-[2rem] text-xl font-black border-amber-500/20 hover:bg-amber-50 transition-all uppercase italic" 
              onClick={scrollToMenu}
            >
              Explore Menu
            </Button>
          </div>

          <div className="flex items-center gap-12 pt-10 border-t border-amber-500/10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-amber-100 overflow-hidden">
                    <Image src={`https://picsum.photos/seed/${i + 10}/40/40`} alt="user" width={40} height={40} />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />)}
                </div>
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">10k+ Happy Diners</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center items-center animate-in fade-in zoom-in-75 duration-1000 delay-300">
          <div className="absolute w-[120%] h-[120%] bg-amber-500/5 blur-[150px] rounded-full animate-pulse" />
          <div className="relative w-full max-w-[600px] aspect-square transition-transform duration-700 hover:rotate-3">
            <Image 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop" 
              alt="Angry Inferno Burger" 
              fill 
              className="object-contain drop-shadow-[0_40px_60px_rgba(225,29,72,0.3)]"
              priority
            />
          </div>
          
          <div className="absolute -top-10 -right-5 bg-white p-8 rounded-[2.5rem] shadow-2xl rotate-12 border border-amber-500/10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Chef's Signature</p>
            <p className="text-3xl font-black text-foreground uppercase italic tracking-tighter">LEVEL 5 HEAT</p>
            <div className="flex gap-1 mt-3">
              {[1,2,3,4,5].map(i => <Flame key={i} className="h-5 w-5 fill-primary text-primary" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}