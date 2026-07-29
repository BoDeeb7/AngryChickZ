
'use client';

import { Button } from '@/components/ui/button';
import { Flame, ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/5 -skew-x-12 transform origin-top-right -z-10" />
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 text-red-600 font-bold text-sm animate-pulse">
            <Zap className="h-4 w-4 fill-red-600" /> NEW GOURMET RANGE OUT NOW
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
            Feel The <br />
            <span className="text-red-600 italic">Angry</span> <br />
            Crunch.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
            The spiciest, juiciest, and most satisfying chicken you've ever had. Double dipped, hand-breaded, and fried to perfection.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-lg font-bold shadow-xl shadow-red-600/20 group" onClick={scrollToMenu}>
              Explore Menu <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl text-lg font-bold border-2" onClick={scrollToMenu}>
              Our Best Sellers
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 w-12 rounded-full border-4 border-background bg-muted overflow-hidden relative">
                  <Image src={`https://picsum.photos/seed/${i + 50}/100/100`} alt="user" fill className="object-cover" />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-bold">10k+ Happy ChickZ</p>
              <div className="flex text-yellow-400">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400/20 blur-[100px] rounded-full -z-10" />
          <div className="relative aspect-square w-full max-w-xl mx-auto drop-shadow-[0_20px_50px_rgba(220,38,38,0.3)] animate-float">
             <Image 
              src="https://picsum.photos/seed/burger-hero/800/800" 
              alt="Angry Burger" 
              fill 
              className="object-contain"
              priority
              data-ai-hint="crispy chicken burger"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
