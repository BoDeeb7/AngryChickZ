
'use client';

import Link from 'next/link';
import { ShoppingBag, Shield, Menu } from 'lucide-react';
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
      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'py-2 px-4' : 'py-6 px-4 md:px-8'}`}>
        <div className={`container mx-auto max-w-6xl rounded-2xl md:rounded-[2rem] px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-2xl transition-all duration-500 ${isScrolled ? 'glass-header bg-black/60 border-amber-500/20' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-3 md:gap-4 group">
            <div className="relative h-10 w-10 md:h-12 md:w-12 flex items-center justify-center flex-shrink-0">
              {storeSettings?.logo ? (
                <Image src={storeSettings.logo} alt="Logo" fill className="object-contain" priority sizes="48px" />
              ) : (
                <div className="h-full w-full bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                   <span className="text-sm md:text-xl font-black text-amber-500 italic">AC</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-3xl font-black uppercase italic leading-none bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent tracking-tighter">
                ANGRY <span className="text-white">CHICKZ</span>
              </span>
              <span className="text-[7px] md:text-[9px] font-bold text-amber-500/60 uppercase tracking-widest mt-0.5 hidden sm:block">Premium Fried Chicken</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-white/5 border border-white/10 hover:bg-amber-500/20 transition-all">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
              </Button>
            </Link>
            <ThemeSwitcher />
            <Button 
              className="relative h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 active:scale-90 transition-all" 
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-amber-500">
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
