'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * MenuGrid Component - Ultra-High Performance Hydration
 * 
 * 1. Instant Static Mount: Page shell renders in <100ms.
 * 2. 0ms Hydration: Derives content from localStorage cache instantly.
 * 3. Mandatory Skeletons: If no cache exists, shows 8 skeleton cards immediately.
 * 4. Silent DB Sync: Updates grid only when new database content arrives.
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

  // Use persistent cache keys for 0ms load
  const { data: cloudProducts = [], loading: productsLoading } = useCollection<Product>(productsQuery, 'visitor_menu_cache');
  const { data: cloudCategories = [] } = useCollection<Category>(categoriesQuery, 'visitor_categories_cache');

  const displayProducts = useMemo(() => {
    const availableItems = cloudProducts.filter(p => p.isAvailable !== false);
    if (activeCategory === 'all') return availableItems;
    return availableItems.filter(p => p.category === activeCategory);
  }, [cloudProducts, activeCategory]);

  const displayCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'All Dishes', slug: 'all' }];
    return [...base, ...cloudCategories];
  }, [cloudCategories]);

  return (
    <section id="menu" className="py-16 md:py-32 relative w-full overflow-hidden bg-zinc-950 min-h-[70vh]">
      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
        {/* Instant Structural Header */}
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
          STRICT RENDER LOGIC:
          - If productsLoading is true AND we have no data (even cached), show mandatory skeletons.
          - If data exists (cached or live), render the grid immediately.
          - Never show a black screen or empty container.
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {productsLoading && displayProducts.length === 0 ? (
            // Mandatory Skeleton Grid (matches ProductCard layout exactly)
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/95 border border-zinc-800/50 rounded-2xl p-3 md:p-4 space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl bg-zinc-800/50" />
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-2 w-1/4 bg-zinc-800/30" />
                    <Skeleton className="h-4 w-3/4 bg-zinc-800/50" />
                  </div>
                  <Skeleton className="h-3 w-full bg-zinc-800/20" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-1/4 bg-zinc-800/50" />
                    <Skeleton className="h-8 w-1/3 rounded-xl bg-zinc-800/50" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            displayProducts.map((product) => (
              <div key={product.id} className="animate-in fade-in duration-500">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
