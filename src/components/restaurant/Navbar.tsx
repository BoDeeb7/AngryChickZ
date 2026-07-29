
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ShieldCheck, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';

export function Navbar() {
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 py-6 ${isScrolled ? 'bg-[#0F0F12]/80 backdrop-blur-3xl py-4' : 'bg-transparent'}`}>
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-5 group">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-[1.5rem] border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform duration-700">
            <Image 
              src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=200&h=200&auto=format&fit=crop" 
              alt="Angry ChickZ" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white leading-none">
              ANGRY <span className="text-red-600">CHICKZ</span>
            </span>
            <span className="text-[10px] font-black tracking-[0.4em] text-red-500/80 uppercase mt-2">Gourmet Heat Sector</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/admin" className="hidden lg:flex items-center gap-3 px-6 py-3 rounded-full border border-white/5 bg-white/5 hover:bg-red-600/10 hover:border-red-600/30 transition-all text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-white">
            <ShieldCheck className="h-4 w-4 text-red-600" />
            Command Center
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] bg-white/5 hover:bg-red-600/10 border border-white/10 hover:border-red-600/30 transition-all duration-500 group shadow-2xl"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
            {itemCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-[12px] font-black h-7 w-7 rounded-full flex items-center justify-center border-4 border-[#0F0F12] shadow-xl animate-pulse">
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
