
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
    </div>
  );
}
