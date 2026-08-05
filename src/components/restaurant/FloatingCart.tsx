'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { CartDrawer } from './CartDrawer';
import { cn } from '@/lib/utils';

export function FloatingCart() {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger a "wiggle" animation when item count increases
  useEffect(() => {
    if (itemCount > 0) {
      setIsWiggling(true);
      const timer = setTimeout(() => setIsWiggling(false), 500);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  if (!mounted || itemCount === 0) return null;

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[9999] cursor-pointer group select-none transition-all duration-500",
          "animate-in fade-in zoom-in slide-in-from-bottom-10",
          isWiggling && "scale-110"
        )}
      >
        <div className="relative">
          {/* Animated Glow Aura */}
          <div className="absolute inset-[-10px] bg-amber-500/30 rounded-full blur-2xl group-hover:bg-amber-500/50 transition-all duration-500 animate-pulse" />
          
          {/* Main Button Shell */}
          <div className={cn(
            "relative h-16 w-16 md:h-20 md:w-20 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] border-2 border-white/20 active:scale-90 transition-all duration-300",
            isWiggling && "animate-bounce"
          )}>
            <ShoppingBag className="h-7 w-7 md:h-9 md:w-9 text-black group-hover:rotate-12 transition-transform" />
            
            {/* Pulsing Badge */}
            <span className="absolute -top-1 -right-1 bg-white text-black text-[11px] md:text-sm font-black h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center border-2 border-amber-500 shadow-lg animate-in zoom-in duration-300">
              {itemCount}
            </span>
          </div>
          
          {/* Tooltip Label */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-white text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 uppercase italic tracking-widest border border-white/10 shadow-xl">
            View Basket
          </div>
        </div>
      </div>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
