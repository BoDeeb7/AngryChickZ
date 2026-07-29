'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MenuGrid() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('all');
  
  // States for local/sync data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Firebase references
  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);

  const { data: dbProducts = [] } = useCollection<Product>(productsRef);
  const { data: dbCategories = [] } = useCollection<Category>(categoriesRef);

  // Sync with LocalStorage as requested (Wiped initially in prompt)
  useEffect(() => {
    const savedProducts = localStorage.getItem('angry_chickz_products');
    const savedCats = localStorage.getItem('angry_chickz_categories');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCats) setCategories(JSON.parse(savedCats));
  }, []);

  // Use DB data if available, otherwise local
  const currentProducts = dbProducts.length > 0 ? dbProducts : products;
  const currentCategories = dbCategories.length > 0 ? dbCategories : categories;

  const displayCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'All Dishes', slug: 'all' }];
    return [...base, ...currentCategories];
  }, [currentCategories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return currentProducts;
    return currentProducts.filter(p => p.category === activeCategory);
  }, [currentProducts, activeCategory]);

  return (
    <section id="menu" className="py-16 md:py-32 relative w-full overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full max-w-full">
        <div className="flex flex-col items-center text-center mb-12 md:mb-20 gap-8">
          <div className="space-y-3">
            <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] block">Premium Menu Selection</span>
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic">Masterful Menu</h2>
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
                      : "text-foreground/30 hover:text-foreground/50"
                  )}
                >
                  {cat.name}
                  {activeCategory === cat.slug && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300 shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <Utensils className="h-16 w-16 mx-auto mb-6 text-zinc-800" />
            <h3 className="text-xl font-bold text-foreground uppercase italic mb-2">Catalog Empty</h3>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Refresh your catalog in the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}
