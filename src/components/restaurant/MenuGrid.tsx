
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, Utensils } from 'lucide-react';
import { MOCK_DATA } from '@/lib/mock-data';

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'All', slug: 'all' },
  { id: '2', name: 'Burgers', slug: 'burgers' },
  { id: '3', name: 'Crispy Meals', slug: 'crispy-meals' },
  { id: '4', name: 'Sides', slug: 'sides' },
  { id: '5', name: 'Drinks', slug: 'drinks' },
];

export function MenuGrid() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('all');

  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);

  const { data: dbProducts = [], loading: productsLoading } = useCollection<Product>(productsRef);
  const { data: dbCategories = [] } = useCollection<Category>(categoriesRef);

  const categories = useMemo(() => {
    return dbCategories.length > 0 ? [{ id: 'all', name: 'All', slug: 'all' }, ...dbCategories] : DEFAULT_CATEGORIES;
  }, [dbCategories]);

  const displayProducts = useMemo(() => {
    const combined = dbProducts.length > 0 ? dbProducts : (MOCK_DATA as unknown as Product[]);
    if (activeCategory === 'all') return combined;
    return combined.filter(p => p.category === activeCategory);
  }, [dbProducts, activeCategory]);

  return (
    <section id="menu" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <p className="text-red-500 font-bold uppercase tracking-[0.3em] text-xs">Fresh & Delicious</p>
            <h2 className="text-5xl font-extrabold text-white tracking-tight">Our Gourmet Menu</h2>
          </div>

          <div className="flex flex-wrap gap-2 glass-panel p-1.5 rounded-2xl">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.slug ? 'default' : 'ghost'}
                className={`rounded-xl px-6 h-12 font-bold transition-all duration-300 ${activeCategory === cat.slug ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {productsLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Gathering Flavors...</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card rounded-3xl border-dashed border-white/10">
            <Utensils className="h-16 w-16 mx-auto mb-6 text-white/10" />
            <h3 className="text-2xl font-bold text-white mb-2">No Items Found</h3>
            <p className="text-white/40">We're updating our menu. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
