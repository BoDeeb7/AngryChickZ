'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Flame, Trophy } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-40 overflow-hidden ambient-glow mesh-transition">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-glow-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[150px] rounded-full animate-glow-slow delay-700" />

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-card/50 backdrop-blur-md border border-primary/10 text-primary font-black text-[11px] uppercase tracking-[0.3em] shadow-sm">
            <Trophy className="h-4 w-4" /> Award Winning Flavors
          </div>
          
          <h1 className="text-6xl lg:text-[100px] font-black leading-[0.95] tracking-tighter text-foreground uppercase italic">
            Crave The <span className="text-primary drop-shadow-[0_0_15px_rgba(225,29,72,0.3)]">Heat.</span> <br />
            Taste The <span className="text-secondary drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">Perfection.</span>
          </h1>
          
          <p className="text-xl text-foreground/60 max-w-lg leading-relaxed font-medium">
            From our 24-hour brine to our secret triple-crunch coating, we redefine the gourmet fried chicken experience.
          </p>

          <div className="flex flex-wrap gap-6">
            <Button 
              size="lg" 
              className="h-24 px-12 rounded-[2.5rem] bg-primary hover:bg-primary/90 text-white text-2xl font-black transition-all shadow-[0_20px_40px_-10px_rgba(225,29,72,0.5)] hover:shadow-primary/60 group uppercase italic" 
              onClick={scrollToMenu}
            >
              Order Now <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-3 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-24 px-12 rounded-[2.5rem] text-2xl font-black border-primary/10 hover:bg-primary/5 transition-all uppercase italic backdrop-blur-sm" 
              onClick={scrollToMenu}
            >
              Explore Menu
            </Button>
          </div>

          <div className="flex items-center gap-12 pt-12 border-t border-primary/5">
            <div className="flex items-center gap-5">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 w-12 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <Image src={`https://picsum.photos/seed/${i + 50}/48/48`} alt="user" width={48} height={48} />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary" />)}
                </div>
                <p className="text-[11px] font-black text-foreground/40 uppercase tracking-widest mt-2">Trusted by 15k+ Diners</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center items-center animate-in fade-in zoom-in-90 duration-1000 delay-300">
          <div className="absolute w-[140%] h-[140%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
          <div className="relative w-full max-w-[650px] aspect-square transition-transform duration-1000 hover:rotate-3">
            <Image 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop" 
              alt="Angry Inferno Burger" 
              fill 
              className="object-contain drop-shadow-[0_60px_80px_rgba(0,0,0,0.4)]"
              priority
            />
          </div>
          
          <div className="absolute -top-10 -right-5 glass-card p-10 rounded-[3rem] rotate-12 border-primary/10 shadow-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-3">Chef's Signature</p>
            <p className="text-4xl font-black text-foreground uppercase italic tracking-tighter">LEVEL 5 HEAT</p>
            <div className="flex gap-1.5 mt-4">
              {[1,2,3,4,5].map(i => <Flame key={i} className="h-6 w-6 fill-primary text-primary" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}