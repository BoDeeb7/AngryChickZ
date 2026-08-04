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

  useEffect(() => {
    setMounted(true);
  }, []);

  // لا تظهر السلة إذا لم يكن هناك أصناف أو إذا لم يتم تحميل المكون بعد
  if (!mounted || itemCount === 0) return null;

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[9999] animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 cursor-pointer group"
      >
        <div className="relative">
          {/* تأثير الوهج خلف الزر */}
          <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl group-hover:bg-primary/60 transition-all duration-300 animate-pulse" />
          
          {/* جسم الزر الرئيسي */}
          <div className="relative h-16 w-16 md:h-20 md:w-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-white/20 active:scale-90 transition-all hover:rotate-6">
            <ShoppingBag className="h-7 w-7 md:h-9 md:w-9 text-white" />
            
            {/* مؤشر عدد الأصناف */}
            <span className="absolute -top-1 -right-1 bg-white text-primary text-[11px] md:text-sm font-black h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center border-2 border-primary shadow-lg animate-bounce">
              {itemCount}
            </span>
          </div>
          
          {/* نص توضيحي يظهر فوق الزر */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-[9px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity uppercase italic tracking-widest">
            عرض السلة
          </div>
        </div>
      </div>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
