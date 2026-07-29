'use client';

import Link from 'next/link';
import { ShoppingBag, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';
import { ThemeSwitcher } from './ThemeSwitcher';
import Image from 'next/image';

export function Navbar() {
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'py-2 px-4' : 'py-6 px-4 md:px-8'}`}>
        <div className={`container mx-auto max-w-5xl rounded-[2.5rem] px-6 md:px-10 py-3 md:py-4 flex items-center justify-between shadow-2xl transition-all duration-500 ${isScrolled ? 'glass-header' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-3 md:gap-4 group">
            <div className="relative h-12 w-12 md:h-14 md:w-14 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 flex items-center justify-center">
              {!logoError ? (
                <img 
                  src="/logo.png" 
                  alt="Angry ChickZ" 
                  className="h-full w-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="h-full w-full bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                   <span className="text-[10px] font-black text-amber-500 italic">AC</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-foreground leading-none uppercase italic">
                ANGRY <span className="text-primary">CHICKZ</span>
              </span>
              {logoError && (
                <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase mt-1">Official Release</span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/admin">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-foreground/5 hover:bg-primary/20 backdrop-blur-md border border-foreground/10 transition-all group"
                title="Admin Login"
              >
                <Shield className="h-5 w-5 text-foreground/40 group-hover:text-primary transition-colors" />
              </Button>
            </Link>
            
            <ThemeSwitcher />
            
            <Button 
              className="relative h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-background text-[10px] font-black h-5 w-5 md:h-6 md:w-6 rounded-full flex items-center justify-center border-2 md:border-4 border-background animate-in zoom-in">
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
