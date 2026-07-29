
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${isScrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-red-600 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Image 
                src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=200&h=200&auto=format&fit=crop" 
                alt="Angry ChickZ" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                ANGRY <span className="text-red-600">CHICKZ</span>
              </span>
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Premium Fast Food</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" className="hidden sm:flex text-white/60 hover:text-white hover:bg-white/5 gap-2">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              className="relative h-12 w-12 rounded-full glass-panel hover:bg-red-600/10 transition-all duration-300"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#0d0e12] animate-in zoom-in">
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
