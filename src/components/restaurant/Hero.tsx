
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, Star } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-red-500 font-bold text-xs uppercase tracking-wider">
            <Flame className="h-3 w-3 fill-red-500" /> New Season Special
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-extrabold leading-[1.1] tracking-tight text-white">
            Unleash The <br />
            <span className="text-transparent bg-clip-text bg-angry-gradient">Perfect</span> Heat.
          </h1>
          
          <p className="text-lg text-white/60 max-w-lg leading-relaxed font-medium">
            Gourmet chicken, precision-fried and tossed in our secret spice blend. Experience the heat that keeps you coming back for more.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="h-16 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xl font-bold transition-all duration-300 shadow-xl shadow-red-600/20 group" 
              onClick={scrollToMenu}
            >
              Order Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 px-10 rounded-2xl text-xl font-bold border-white/10 hover:bg-white/5 transition-all duration-300" 
              onClick={scrollToMenu}
            >
              Explore Menu
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-white/5">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0d0e12] overflow-hidden relative">
                  <Image src={`https://picsum.photos/seed/${i + 10}/100/100`} alt="customer" fill className="object-cover" />
                </div>
              ))}
            </div>
            <div className="space-y-0.5">
              <div className="flex text-amber-500 gap-0.5">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-amber-500" />)}
              </div>
              <p className="text-white/40 font-medium text-[10px] uppercase tracking-widest">12,000+ Happy Customers</p>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center items-center animate-in fade-in zoom-in-75 duration-1000 delay-300">
          <div className="absolute w-[120%] h-[120%] bg-red-600/10 blur-[150px] rounded-full" />
          <div className="relative w-full max-w-[550px] aspect-square animate-float">
            <Image 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&h=1000&auto=format&fit=crop" 
              alt="The Inferno Burger" 
              fill 
              className="object-contain drop-shadow-[0_20px_50px_rgba(220,38,38,0.4)]"
              priority
            />
          </div>
          
          <div className="absolute -top-4 -right-4 glass-panel p-5 rounded-2xl shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-0.5">Heat Level</p>
            <p className="text-xl font-extrabold text-white uppercase italic">Extreme</p>
          </div>
        </div>
      </div>
    </section>
  );
}
