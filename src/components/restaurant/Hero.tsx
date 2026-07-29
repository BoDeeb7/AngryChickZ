'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Play } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-48 pb-32 overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10 relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel text-red-500 font-black text-xs tracking-widest uppercase">
            <Zap className="h-4 w-4 fill-red-500" /> Season 2: The Heat is On
          </div>
          
          <div className="space-y-2">
            <h1 className="text-7xl lg:text-9xl font-black leading-[0.85] tracking-tighter uppercase text-white">
              Tame The <br />
              <span className="text-transparent bg-clip-text bg-angry-gradient italic">Angry</span> <br />
              Flavor.
            </h1>
          </div>
          
          <p className="text-xl text-white/60 max-w-lg leading-relaxed font-medium">
            Experience the fusion of high-end gourmet culinary techniques with the raw, untamed heat of our secret spice blend.
          </p>

          <div className="flex flex-wrap gap-6">
            <Button size="lg" className="h-16 px-10 rounded-3xl bg-red-600 hover:bg-red-700 text-white text-xl font-black italic uppercase tracking-tighter btn-glow-red transition-all group" onClick={scrollToMenu}>
              Get The Heat <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 rounded-3xl text-xl font-black italic uppercase tracking-tighter border-2 border-white/10 hover:bg-white/5 transition-all flex gap-3" onClick={scrollToMenu}>
              <Play className="h-5 w-5 fill-white" /> Secret Menu
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-8 border-t border-white/10">
            <div className="flex -space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 w-14 rounded-2xl border-4 border-black bg-white/10 overflow-hidden relative glass-panel">
                  <Image src={`https://picsum.photos/seed/${i + 20}/100/100`} alt="customer" fill className="object-cover" />
                </div>
              ))}
              <div className="h-14 w-14 rounded-2xl border-4 border-black bg-red-600 flex items-center justify-center font-black text-xs text-white">
                +4K
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white font-black uppercase italic tracking-widest text-xs">Certified Addictive</p>
              <div className="flex text-yellow-400 gap-1">
                {'★★★★★'.split('').map((s, i) => <span key={i} className="text-glow-gold">{s}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="relative lg:h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 bg-red-600/20 blur-[150px] rounded-full" />
          <div className="relative w-full aspect-square animate-float">
             <Image 
              src="https://picsum.photos/seed/angry-hero-burger/1000/1000" 
              alt="The Angry Burger" 
              fill 
              className="object-contain drop-shadow-[0_35px_60px_rgba(220,38,38,0.5)]"
              priority
              data-ai-hint="luxury chicken burger"
            />
          </div>
          
          {/* Floating Detail Badges */}
          <div className="absolute top-10 right-10 glass-panel p-4 rounded-3xl animate-bounce delay-100">
            <p className="text-[10px] font-black uppercase text-red-500">Heat Level</p>
            <p className="text-lg font-black italic text-white">EXTREME</p>
          </div>
          <div className="absolute bottom-10 left-0 glass-panel p-4 rounded-3xl animate-bounce delay-300">
            <p className="text-[10px] font-black uppercase text-yellow-500">Secret Recipe</p>
            <p className="text-lg font-black italic text-white">#09-DARK</p>
          </div>
        </div>
      </div>
    </section>
  );
}