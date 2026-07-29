'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, LayoutDashboard, Menu as MenuIcon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';

export function Navbar() {
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 py-6 ${isScrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent'}`}>
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-6 group">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-all duration-500">
              <Image 
                src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=200&h=200&auto=format&fit=crop" 
                alt="Angry ChickZ Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white leading-none uppercase">
                ANGRY <span className="text-red-600">CHICKZ</span>
              </span>
              <span className="text-[9px] font-bold text-red-600/60 uppercase tracking-[0.4em] mt-1.5">Executive Gourmet Heat</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/admin">
              <Button variant="ghost" className="hidden md:flex text-white/40 hover:text-white hover:bg-white/5 gap-2 uppercase text-[10px] font-black tracking-widest">
                <LayoutDashboard className="h-4 w-4" /> Management
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              className="relative h-14 w-14 rounded-full glass-panel hover:bg-red-600/20 hover:border-red-600/50 transition-all duration-500 group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-[#08090a] shadow-lg animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}