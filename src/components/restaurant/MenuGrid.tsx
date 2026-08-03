'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * MenuGrid Component
 * Fetches products and categories directly from Firestore in real-time.
 * Ensures that data is persistent and visible to all users globally.
 */
export function MenuGrid() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Real-time queries for products and categories with stable refs
  const productsQuery = useMemo(() => {
    if (!db) return null;
    // FETCH DIRECTLY FROM CLOUD
    return query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    // FETCH DIRECTLY FROM CLOUD
    return query(collection(db, 'categories'), orderBy('name', 'asc'));
  }, [db]);

  // Firestore hooks provide real-time data stream
  const { data: cloudProducts = [], loading: productsLoading } = useCollection<Product>(productsQuery);
  const { data: cloudCategories = [] } = useCollection<Category>(categoriesQuery);

  // Dynamically compute display categories based on cloud data
  const displayCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'All Dishes', slug: 'all' }];
    
    // If we have explicit categories from cloud, use them.
    if (cloudCategories.length > 0) {
      return [...base, ...cloudCategories];
    }
    
    // Fallback: infer from products if categories collection is empty
    const uniqueCats = Array.from(new Set(cloudProducts.map(p => p.category)));
    return [...base, ...uniqueCats.map(cat => ({ 
      id: cat, 
      name: cat.charAt(0).toUpperCase() + cat.slice(1), 
      slug: cat 
    }))];
  }, [cloudCategories, cloudProducts]);

  // Filter products based on active category and availability
  const filteredProducts = useMemo(() => {
    // Show items that are available (isAvailable defaults to true)
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

        {/* Global Persistence Visibility */}
        {productsLoading && cloudProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest italic text-white">Fetching Live Cloud Data...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 opacity-20">
             <p className="text-xl font-black uppercase italic text-white">No Items Found in This Category</p>
             <p className="text-[8px] font-bold uppercase tracking-widest mt-2">Cloud Database is Empty or Synchronizing</p>
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