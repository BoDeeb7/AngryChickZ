'use client';

import Link from 'next/link';
import { ShoppingBag, LayoutDashboard, UtensilsCrossed, Menu } from 'lucide-react';
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
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl transition-all duration-700 ${isScrolled ? 'top-4' : 'top-6'}`}>
        <div className={`rounded-[3rem] px-10 py-5 flex items-center justify-between shadow-2xl transition-all duration-700 ${isScrolled ? 'glass-header py-4' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-4 group">
            <div className="bg-primary p-3 rounded-[1.25rem] shadow-xl group-hover:rotate-12 transition-transform duration-500">
              <UtensilsCrossed className="text-white h-7 w-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-foreground leading-none uppercase">
                ANGRY <span className="text-primary">CHICKZ</span>
              </span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1.5 opacity-60">Gourmet Elite</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-12">
            {['Menu', 'Specials', 'Delivery', 'Reviews'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black text-foreground/40 hover:text-primary transition-all uppercase tracking-[0.3em]">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <ThemeSwitcher />
            
            <Link href="/admin">
              <Button variant="ghost" className="hidden sm:flex text-foreground/40 hover:text-primary hover:bg-primary/5 gap-3 uppercase text-[10px] font-black tracking-[0.2em] h-16 rounded-full px-8 border border-primary/5 backdrop-blur-sm">
                <LayoutDashboard className="h-4 w-4" /> Command
              </Button>
            </Link>
            
            <Button 
              className="relative h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl hover:shadow-primary/40 transition-all duration-500 group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-6 w-6 group-hover:scale-110 transition-transform duration-500" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-background text-[11px] font-black h-7 w-7 rounded-full flex items-center justify-center border-4 border-background shadow-2xl animate-in zoom-in duration-500">
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