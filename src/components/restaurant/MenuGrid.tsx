'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * MenuGrid Component - High Performance Mode
 * 1. Zero-Delay: Uses cached data instantly via SWR logic in useCollection.
 * 2. No Black Screens: The loader only appears if no data is present AND fetch is active.
 * 3. No "Not Found" States: UI strictly shows products or the loading sync.
 */
export function MenuGrid() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('all');
  
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('name', 'asc'));
  }, [db]);

  // Hook hydrates INSTANTLY from localStorage
  const { data: cloudProducts = [], loading: productsLoading } = useCollection<Product>(productsQuery);
  const { data: cloudCategories = [] } = useCollection<Category>(categoriesQuery);

  const displayCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'All Dishes', slug: 'all' }];
    
    if (cloudCategories.length > 0) {
      return [...base, ...cloudCategories];
    }
    
    const uniqueCats = Array.from(new Set(cloudProducts.map(p => p.category)));
    return [...base, ...uniqueCats.map(cat => ({ 
      id: cat, 
      name: cat.charAt(0).toUpperCase() + cat.slice(1), 
      slug: cat 
    }))];
  }, [cloudCategories, cloudProducts]);

  const filteredProducts = useMemo(() => {
    const availableItems = cloudProducts.filter(p => p.isAvailable !== false);
    
    if (activeCategory === 'all') {
      return availableItems;
    }
    return availableItems.filter(p => p.category === activeCategory);
  }, [cloudProducts, activeCategory]);

  return (
    <section id="menu" className="py-16 md:py-32 relative w-full overflow-hidden bg-zinc-950 min-h-[50vh]">
      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
        <div className="flex flex-col items-center text-center mb-12 md:mb-20 gap-8">
          <div className="space-y-3">
            <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] block">Premium Selection</span>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tighter uppercase italic">The Menu</h2>
          </div>

          <div className="w-full max-w-4xl">
            <div className="flex flex-row overflow-x-auto no-scrollbar gap-8 justify-start md:justify-center py-4 items-center px-4">
              {displayCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={cn(
                    "relative text-[11px] md:text-[13px] font-bold uppercase tracking-[0.2em] transition-all duration-300 pb-2 whitespace-nowrap outline-none",
                    activeCategory === cat.slug 
                      ? "text-primary scale-105" 
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {cat.name}
                  {activeCategory === cat.slug && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 
          ZERO-DELAY UI:
          Show loader ONLY if we have absolutely NO data (first time user).
          If we have cached data, we show it instantly even if loading=true.
        */}
        {productsLoading && cloudProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest italic text-white/40">Syncing Live Menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 animate-in fade-in duration-500">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
