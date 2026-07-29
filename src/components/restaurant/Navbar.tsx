'use client';

import Link from 'next/link';
import { ShoppingBag, LayoutDashboard, UtensilsCrossed } from 'lucide-react';
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
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl transition-all duration-500 ${isScrolled ? 'top-2' : 'top-4'}`}>
        <div className="glass-header rounded-[2.5rem] px-8 py-4 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">
              <UtensilsCrossed className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-foreground leading-none uppercase">
                ANGRY <span className="text-primary">CHICKZ</span>
              </span>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Gourmet Fried Chicken</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {['Menu', 'Specials', 'Delivery', 'Reviews'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors uppercase tracking-widest">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" className="hidden sm:flex text-foreground/40 hover:text-primary hover:bg-primary/5 gap-2 uppercase text-[10px] font-black tracking-widest">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Button>
            </Link>
            
            <Button 
              className="relative h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-primary/30 transition-all group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-foreground text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-in zoom-in">
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