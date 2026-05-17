
"use client";

import { Hero } from '@/components/shop/Hero';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ShoppingBag, Star, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-background">
      <Hero />
      
      {/* Social Proof / Features */}
      <section className="py-12 glass border-y border-white/5">
        <div className="container mx-auto px-6 flex flex-wrap justify-between gap-8 items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">4.9/5 Rating</p>
              <p className="text-xs text-muted-foreground">From 10k+ reviews</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Instant Checkout</p>
              <p className="text-xs text-muted-foreground">Lightning fast shipping</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Secure Vault</p>
              <p className="text-xs text-muted-foreground">256-bit SSL encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Luxury Brands</p>
              <p className="text-xs text-muted-foreground">Curated premium selection</p>
            </div>
          </div>
        </div>
      </section>

      <ProductGrid />

      {/* Modern Newsletter Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="relative glass p-12 md:p-20 rounded-[3rem] border-white/10 overflow-hidden text-center max-w-5xl mx-auto">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-fuchsia-600/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-headline font-bold">Join the <span className="text-gradient">Inner Circle</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
              Unlock exclusive access to early product drops, limited edition designs, and VIP events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-6">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow h-14 bg-white/5 border border-white/10 rounded-full px-6 focus:outline-none focus:border-fuchsia-500 transition-colors"
              />
              <button className="h-14 px-8 bg-fuchsia-600 hover:bg-fuchsia-700 glow-fuchsia rounded-full font-bold transition-all">
                Subscribe
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-4 opacity-50">
              NO SPAM &bull; UNSUBSCRIBE ANYTIME &bull; PRIVACY PROTECTED
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
