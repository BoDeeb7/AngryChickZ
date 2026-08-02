
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'py-3 px-4' : 'py-8 px-6 md:px-12'}`}>
        <div className={`container mx-auto max-w-6xl rounded-[2.5rem] px-10 py-5 flex items-center justify-between shadow-2xl transition-all duration-500 ${isScrolled ? 'glass-header bg-background/80' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-6 group">
            <div className="relative h-16 w-16 md:h-20 md:w-20 flex items-center justify-center">
              {storeSettings?.logo ? (
                <Image src={storeSettings.logo} alt="Logo" fill className="object-contain" priority sizes="80px" />
              ) : (
                <div className="h-full w-full bg-amber-500/20 rounded-3xl flex items-center justify-center border border-amber-500/30">
                   <span className="text-xl md:text-3xl font-black text-amber-500 italic">AC</span>
                </div>
              )}
            </div>
            <span className="text-5xl md:text-7xl font-black uppercase italic bg-gradient-to-r from-amber-400 via-red-500 to-amber-600 bg-clip-text text-transparent tracking-tighter transition-all duration-500 group-hover:scale-105">
              ANGRY <span className="text-foreground">CHICKZ</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-foreground/5">
                <Shield className="h-6 w-6 text-foreground/40" />
              </Button>
            </Link>
            <ThemeSwitcher />
            <Button className="relative h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-background text-xs font-black h-7 w-7 rounded-full flex items-center justify-center border-2 border-background">
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
