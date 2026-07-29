
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Play, Star } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12 relative z-10 animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-panel text-red-500 font-black text-xs tracking-[0.2em] uppercase">
            <Zap className="h-4 w-4 fill-red-500 animate-pulse" /> Global Release: Season 2
          </div>
          
          <div className="space-y-4">
            <h1 className="text-7xl lg:text-[9rem] font-black leading-[0.8] tracking-tighter uppercase text-white">
              Tame The <br />
              <span className="text-transparent bg-clip-text bg-angry-gradient italic">Angry</span> <br />
              Flavor.
            </h1>
          </div>
          
          <p className="text-xl text-white/60 max-w-lg leading-relaxed font-medium border-l-2 border-red-600/30 pl-8">
            The intersection of high-end culinary science and untamed heat. Every bite is a calculated explosion of flavor.
          </p>

          <div className="flex flex-wrap gap-8">
            <Button 
              size="lg" 
              className="h-20 px-12 rounded-[2rem] bg-red-600 hover:bg-red-700 text-white text-2xl font-black italic uppercase tracking-tighter btn-glow-red transition-all duration-500 group" 
              onClick={scrollToMenu}
            >
              Order Deployment <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-3 transition-transform duration-300" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-20 px-12 rounded-[2rem] text-2xl font-black italic uppercase tracking-tighter border-2 border-white/10 hover:bg-white/5 transition-all duration-500 flex gap-4" 
              onClick={scrollToMenu}
            >
              <Play className="h-6 w-6 fill-white" /> Classified Menu
            </Button>
          </div>

          <div className="flex items-center gap-10 pt-10 border-t border-white/5">
            <div className="flex -space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-16 rounded-2xl border-4 border-[#0F0F12] bg-white/5 overflow-hidden relative shadow-2xl">
                  <Image src={`https://picsum.photos/seed/${i + 50}/150/150`} alt="VIP member" fill className="object-cover" />
                </div>
              ))}
              <div className="h-16 w-16 rounded-2xl border-4 border-[#0F0F12] bg-red-600 flex items-center justify-center font-black text-xs text-white shadow-xl">
                +12K
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Verified Addicts</p>
              <div className="flex text-yellow-400 gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-glow-gold" />)}
              </div>
            </div>
          </div>
        </div>

        <div className="relative lg:h-[700px] flex items-center justify-center animate-in fade-in zoom-in-75 duration-1000 delay-300">
          <div className="absolute inset-0 bg-red-600/30 blur-[180px] rounded-full" />
          <div className="relative w-full max-w-[600px] aspect-square animate-float">
             <Image 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&h=1000&auto=format&fit=crop" 
              alt="The Inferno Burger" 
              fill 
              className="object-contain drop-shadow-[0_40px_80px_rgba(220,38,38,0.7)]"
              priority
            />
          </div>
          
          <div className="absolute top-20 right-0 glass-panel p-6 rounded-[2.5rem] animate-orb shadow-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">Volcanic Index</p>
            <p className="text-3xl font-black italic text-white tracking-tighter uppercase">Extreme</p>
          </div>
          
          <div className="absolute bottom-20 left-0 glass-panel p-6 rounded-[2.5rem] animate-orb [animation-delay:3s] shadow-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-1">Signature Dip</p>
            <p className="text-3xl font-black italic text-white tracking-tighter uppercase">#09-Gold</p>
          </div>
        </div>
      </div>
    </section>
  );
}
