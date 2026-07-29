'use client';

import Link from 'next/link';
import { ShoppingCart, Flame, ShieldCheck } from 'lucide-react';
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/40 backdrop-blur-2xl border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-red-600 p-2 rounded-2xl rotate-3 group-hover:rotate-0 transition-all duration-500">
              <Flame className="h-7 w-7 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-white">
              ANGRY <span className="text-red-600">CHICKZ</span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase -mt-1">Ultra Premium Fast Food</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-red-600 transition-colors flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-14 w-14 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            {itemCount > 0 && (
              <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
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