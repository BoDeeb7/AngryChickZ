'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { Utensils } from 'lucide-react';
import { MOCK_DATA } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function MenuGrid() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('all');

  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);

  const { data: dbProducts = [] } = useCollection<Product>(productsRef);
  const { data: dbCategories = [] } = useCollection<Category>(categoriesRef);

  const categories = useMemo(() => {
    const base = [{ id: 'all', name: 'All Dishes', slug: 'all' }];
    return [...base, ...dbCategories];
  }, [dbCategories]);

  // Instant hydration: Use DB products if they exist, otherwise fallback to MOCK_DATA instantly.
  const displayProducts = useMemo(() => {
    const combined = dbProducts.length > 0 ? dbProducts : (MOCK_DATA as unknown as Product[]);
    if (activeCategory === 'all') return combined;
    return combined.filter(p => p.category === activeCategory);
  }, [dbProducts, activeCategory]);

  return (
    <section id="menu" className="py-40 relative mesh-transition-top">
      {/* Background ambient orbs */}
      <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-32 gap-12">
          <div className="space-y-6">
            <span className="text-primary font-black uppercase tracking-[0.5em] text-[12px] block">Premium Sector Selection</span>
            <h2 className="text-6xl lg:text-[120px] font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">Masterful Menu</h2>
          </div>

          <div className="flex flex-row overflow-x-auto no-scrollbar gap-12 justify-center py-6 w-full max-w-4xl border-b border-primary/5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  "relative text-[12px] font-black uppercase tracking-[0.4em] transition-all duration-500 pb-6 whitespace-nowrap",
                  activeCategory === cat.slug 
                    ? "text-primary scale-110" 
                    : "text-foreground/20 hover:text-foreground/40"
                )}
              >
                {cat.name}
                {activeCategory === cat.slug && (
                  <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-primary rounded-full animate-in fade-in slide-in-from-bottom-2 duration-700 shadow-[0_0_10px_rgba(225,29,72,0.4)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Removed loading spinner logic. displayProducts will always have content (either DB or Mock) */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-primary/10">
            <Utensils className="h-20 w-20 mx-auto mb-8 text-foreground/5" />
            <h3 className="text-3xl font-black text-foreground mb-3 uppercase italic">Sector Empty</h3>
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Updating inventory for this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
