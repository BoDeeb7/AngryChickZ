'use client';

import Link from 'next/link';
import { ShoppingBag, Palette, UtensilsCrossed } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Navbar() {
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl transition-all duration-700 ${isScrolled ? 'top-4' : 'top-6'}`}>
        <div className={`rounded-[2.5rem] px-8 py-4 flex items-center justify-between shadow-2xl transition-all duration-700 ${isScrolled ? 'glass-header py-3' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-4 group">
            <div className="bg-primary p-2.5 rounded-2xl shadow-xl group-hover:rotate-12 transition-transform duration-500">
              <UtensilsCrossed className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground leading-none uppercase italic">
              ANGRY <span className="text-primary">CHICKZ</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            
            <Button 
              className="relative h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-background text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-4 border-background animate-in zoom-in">
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
