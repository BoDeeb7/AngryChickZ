'use client';

import Link from 'next/link';
import { ShoppingBag, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { StoreSettings } from '@/types/restaurant';
import Image from 'next/image';

export function Navbar() {
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const db = useFirestore();
  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);
  const { data: storeSettings } = useDoc<StoreSettings>(storeSettingsRef);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'py-2 px-4' : 'py-6 px-4 md:px-8'}`}>
        <div className={`container mx-auto max-w-5xl rounded-[2.5rem] px-8 py-4 flex items-center justify-between shadow-2xl transition-all duration-300 ${isScrolled ? 'glass-header shadow-lg' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-5 group">
            <div className="relative h-14 w-14 flex items-center justify-center">
              {storeSettings?.logo ? (
                <Image src={storeSettings.logo} alt="Logo" fill className="object-contain" priority sizes="56px" />
              ) : (
                <div className="h-full w-full bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                   <span className="text-[14px] font-black text-amber-500 italic">AC</span>
                </div>
              )}
            </div>
            <span className="text-3xl md:text-5xl font-black uppercase italic bg-gradient-to-r from-amber-400 to-red-600 bg-clip-text text-transparent tracking-tighter transition-all duration-300 group-hover:scale-105">
              ANGRY <span className="text-foreground">CHICKZ</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-foreground/5 hover:bg-primary/10">
                <Shield className="h-5 w-5 text-foreground/40" />
              </Button>
            </Link>
            <ThemeSwitcher />
            <Button className="relative h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-background text-[11px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-background">
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
