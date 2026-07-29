
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Navbar() {
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const logoImg = PlaceHolderImages.find(img => img.id === 'logo-main')?.imageUrl || '';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10 py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-2xl border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:scale-105 transition-transform duration-500">
            <Image 
              src={logoImg} 
              alt="Angry ChickZ Logo" 
              fill 
              className="object-cover"
              data-ai-hint="angry chicken logo"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white leading-none">
              ANGRY <span className="text-red-600">CHICKZ</span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-red-500/80 uppercase mt-1">Gourmet Heat Sector</span>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 hover:border-red-500/30">
            <ShieldCheck className="h-3 w-3" />
            <span className="hidden sm:inline">Admin Terminal</span>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-14 w-14 rounded-3xl bg-white/5 hover:bg-red-600/10 border border-white/10 hover:border-red-600/30 transition-all group"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-black animate-pulse shadow-lg shadow-red-600/50">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}
