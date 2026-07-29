'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, Trophy, Crown } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10 relative z-10 animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-panel text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">
            <Crown className="h-3 w-3 fill-amber-500" /> World Famous Hot Chicken
          </div>
          
          <h1 className="text-7xl lg:text-9xl font-black leading-[0.9] tracking-tighter text-white uppercase italic">
            Elite <br />
            <span className="text-transparent bg-clip-text bg-angry-gradient drop-shadow-2xl">Flavor</span> <br />
            Legacy.
          </h1>
          
          <p className="text-xl text-white/40 max-w-lg leading-relaxed font-medium tracking-tight">
            Crafted for the bold. Our 24-hour brine meets a top-secret spice architecture to define the new standard of gourmet fast food.
          </p>

          <div className="flex flex-wrap gap-6">
            <Button 
              size="lg" 
              className="h-20 px-12 rounded-3xl bg-red-600 hover:bg-red-700 text-white text-2xl font-black transition-all duration-500 shadow-[0_10px_40px_rgba(220,38,38,0.3)] hover:shadow-[0_15px_60px_rgba(220,38,38,0.5)] group uppercase italic" 
              onClick={scrollToMenu}
            >
              Taste The Heat <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-20 px-12 rounded-3xl text-2xl font-black border-white/5 hover:bg-white/5 hover:border-white/20 transition-all duration-500 uppercase italic" 
              onClick={scrollToMenu}
            >
              Explore Menu
            </Button>
          </div>

          <div className="flex items-center gap-10 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-widest">#1 Ranked</p>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Heat Experience 2024</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center items-center animate-in fade-in zoom-in-75 duration-1000 delay-300">
          <div className="absolute w-[140%] h-[140%] bg-red-600/10 blur-[180px] rounded-full" />
          <div className="relative w-full max-w-[650px] aspect-square animate-float">
            <Image 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&h=1200&auto=format&fit=crop" 
              alt="The Inferno Signature" 
              fill 
              className="object-contain drop-shadow-[0_40px_80px_rgba(220,38,38,0.6)]"
              priority
            />
          </div>
          
          <div className="absolute top-10 right-0 glass-panel p-8 rounded-[2rem] shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-500">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-2">Signature Heat</p>
            <p className="text-4xl font-black text-white uppercase italic tracking-tighter">MOLTEN</p>
            <div className="flex gap-1 mt-3">
              {[1,2,3,4,5].map(i => <Flame key={i} className="h-4 w-4 fill-red-600 text-red-600" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}