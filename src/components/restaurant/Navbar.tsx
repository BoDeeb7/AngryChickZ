
'use client';

import Link from 'next/link';
import { ShoppingCart, Flame, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-red-600 p-2 rounded-xl rotate-3 group-hover:rotate-0 transition-transform">
            <Flame className="h-6 w-6 text-yellow-400 fill-yellow-400" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter">
            ANGRY <span className="text-red-600">CHICKZ</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-medium hover:text-red-600 transition-colors hidden sm:block">
            Menu Manager
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-12 w-12 rounded-full hover:bg-red-50"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-background">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}
