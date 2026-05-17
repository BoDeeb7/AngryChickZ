
"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-1')?.imageUrl || '';

  const scrollToShop = () => {
    const shopSection = document.getElementById('shop');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center z-10">
        <div className="space-y-8 animate-in slide-in-from-left duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-fuchsia-400">
            <Sparkles className="h-3 w-3" /> New Collection Arrived
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight">
            Elevate Your <span className="text-gradient">Futuristic</span> Lifestyle
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Discover a curated collection of ultra-modern tech, fashion, and accessories designed for those who live on the edge of tomorrow.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 glow-fuchsia group"
              onClick={scrollToShop}
            >
              Shop Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full border-white/10 hover:bg-white/5"
              onClick={scrollToShop}
            >
              View Lookbook
            </Button>
          </div>
        </div>

        <div className="relative aspect-square md:aspect-[4/5] lg:aspect-square animate-in zoom-in duration-1000 delay-200">
          <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 to-violet-500/20 rounded-3xl -rotate-3 scale-105 blur-sm" />
          <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Image 
              src={heroImage} 
              alt="Velozi Hero" 
              fill 
              className="object-cover transition-transform duration-700 hover:scale-105" 
              priority
              data-ai-hint="luxury fashion"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-2xl border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-xl">Aura Hybrid X</h3>
                  <p className="text-sm text-fuchsia-400">Limited Edition Release</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$2,499.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
