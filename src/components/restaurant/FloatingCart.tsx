'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { CartDrawer } from './CartDrawer';
import { cn } from '@/lib/utils';

export function FloatingCart() {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating cart when scrolled down a bit
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If cart is empty, don't show the floating button
  if (itemCount === 0) return null;

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-[60] transition-all duration-500 transform cursor-pointer",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:bg-primary/50 transition-all duration-300 animate-pulse" />
          <div className="relative h-14 w-14 bg-primary rounded-full flex items-center justify-center shadow-2xl border border-white/20 active:scale-90 transition-all">
            <ShoppingBag className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary shadow-sm animate-bounce">
              {itemCount}
            </span>
          </div>
        </div>
      </div>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}