'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

/**
 * MenuGrid Component - Zero-Latency Hydration
 * 1. Instant Render: Uses bundled mock data fallback for immediate first-paint.
 * 2. Silent Sync: Swaps mocks for live cloud data in the background with no spinners.
 * 3. 0-Second Delay: Returning users see their cached menu instantly via useCollection.
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

  // Hydrates instantly from local cache
  const { data: cloudProducts = [] } = useCollection<Product>(productsQuery);
  const { data: cloudCategories = [] } = useCollection<Category>(categoriesQuery);

  // Static Fallback Hydration: Use Mocks if cache/cloud is not yet ready
  const displayProducts = useMemo(() => {
    // If we have any cloud or cached data, prioritize it 100%
    if (cloudProducts.length > 0) {
      const availableItems = cloudProducts.filter(p => p.isAvailable !== false);
      if (activeCategory === 'all') return availableItems;
      return availableItems.filter(p => p.category === activeCategory);
    }

    // Otherwise, render bundled signature dishes to ensure ZERO loading state
    const mocks = MOCK_PRODUCTS.map((p, idx) => ({ ...p, id: `mock-${idx}` } as Product));
    if (activeCategory === 'all') return mocks;
    return mocks.filter(p => p.category === activeCategory);
  }, [cloudProducts, activeCategory]);

  const displayCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'All Dishes', slug: 'all' }];
    
    if (cloudCategories.length > 0) {
      return [...base, ...cloudCategories];
    }
    
    // Fallback categories from mock products
    const uniqueCats = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)));
    return [...base, ...uniqueCats.map(cat => ({ 
      id: cat, 
      name: cat.charAt(0).toUpperCase() + cat.slice(1), 
      slug: cat 
    }))];
  }, [cloudCategories]);

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
          ZERO LOADING STATE UI:
          The grid always renders either Mocks, Cache, or Live Cloud data.
          Background sync happens silently via useCollection.
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 animate-in fade-in duration-500">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
