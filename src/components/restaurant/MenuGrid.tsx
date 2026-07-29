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

  const displayProducts = useMemo(() => {
    const combined = dbProducts.length > 0 ? dbProducts : (MOCK_DATA as unknown as Product[]);
    if (activeCategory === 'all') return combined;
    return combined.filter(p => p.category === activeCategory);
  }, [dbProducts, activeCategory]);

  return (
    <section id="menu" className="py-16 md:py-40 relative mesh-transition-top w-full max-w-full overflow-hidden">
      {/* contained orbs */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full max-w-full">
        <div className="flex flex-col items-center text-center mb-10 md:mb-32 gap-6 md:gap-12">
          <div className="space-y-2 md:space-y-4">
            <span className="text-primary font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[9px] md:text-[12px] block">Premium Catalog Selection</span>
            <h2 className="text-3xl md:text-6xl lg:text-[120px] font-black text-foreground tracking-tighter uppercase italic leading-[1] md:leading-[0.9]">Masterful Menu</h2>
          </div>

          {/* New Minimalist Category Bar */}
          <div className="w-full max-w-4xl px-2">
            <div className="flex flex-row overflow-x-auto no-scrollbar gap-6 md:gap-12 justify-start md:justify-center py-2 scroll-smooth items-center">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={cn(
                    "relative text-[10px] md:text-[13px] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all duration-500 pb-2 whitespace-nowrap outline-none flex flex-col items-center",
                    activeCategory === cat.slug 
                      ? "text-primary scale-105" 
                      : "text-foreground/20 hover:text-foreground/40"
                  )}
                >
                  <span className={cn(
                    "transition-colors duration-500",
                    activeCategory === cat.slug && "bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
                  )}>
                    {cat.name}
                  </span>
                  {activeCategory === cat.slug && (
                    <span className="absolute bottom-0 w-8 md:w-full h-[2px] bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-500 shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-12">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 md:py-40 glass-card rounded-[2rem] md:rounded-[4rem] border-dashed border-primary/10">
            <Utensils className="h-12 w-12 md:h-20 md:w-20 mx-auto mb-4 md:mb-8 text-foreground/5" />
            <h3 className="text-xl md:text-3xl font-black text-foreground mb-2 uppercase italic">Catalog Empty</h3>
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Updating inventory for this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}