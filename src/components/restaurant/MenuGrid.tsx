'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { Utensils, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function MenuGrid() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('all');
  
  /**
   * STABLE QUERIES: Memoize the Firestore query to prevent infinite re-render loops.
   * Standard React hooks like useCollection will re-subscribe if the query reference changes.
   */
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const categoriesRef = useMemo(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);

  const { data: products = [], loading: productsLoading } = useCollection<Product>(productsQuery);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);

  const displayCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'All Dishes', slug: 'all' }];
    return [...base, ...categories];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <section id="menu" className="py-16 md:py-32 relative w-full overflow-hidden bg-zinc-950">
      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full max-w-full">
        <div className="flex flex-col items-center text-center mb-12 md:mb-20 gap-8">
          <div className="space-y-3">
            <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] block">Premium Menu Selection</span>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tighter uppercase italic">Masterful Menu</h2>
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
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl bg-zinc-900" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3 bg-zinc-900" />
                  <Skeleton className="h-4 w-full bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <Utensils className="h-16 w-16 mx-auto mb-6 text-zinc-800" />
            <h3 className="text-xl font-bold text-zinc-100 uppercase italic mb-2">Menu Coming Soon</h3>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">We are hand-brining something special.</p>
          </div>
        )}
      </div>
    </section>
  );
}
