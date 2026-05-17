
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Product, Category } from '@/types/shop';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function ProductGrid() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Firebase references
  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);

  // Data hooks
  const { data: products = [], loading: productsLoading } = useCollection<Product>(productsRef);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section className="py-20 container mx-auto px-6" id="shop">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div>
          <h2 className="text-4xl font-headline font-bold mb-2">Discover Our <span className="text-gradient">Vault</span></h2>
          <p className="text-muted-foreground">Premium products curated for the modern era.</p>
        </div>

        <div className="flex flex-wrap gap-2 glass p-1 rounded-full border-white/5 overflow-x-auto max-w-full">
          <Button
            variant="ghost"
            className={`rounded-full px-6 transition-all duration-300 ${activeCategory === 'All' ? 'bg-fuchsia-600 text-white glow-fuchsia' : 'hover:bg-white/5'}`}
            onClick={() => setActiveCategory('All')}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant="ghost"
              className={`rounded-full px-6 transition-all duration-300 ${activeCategory === cat.name ? 'bg-fuchsia-600 text-white glow-fuchsia' : 'hover:bg-white/5'}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {productsLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProductCard product={product} />
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-24 glass rounded-3xl border-white/5">
              <p className="text-muted-foreground">No products found in this section yet.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
