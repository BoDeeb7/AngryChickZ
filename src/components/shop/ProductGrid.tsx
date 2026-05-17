
"use client";

import { useState } from 'react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { Category } from '@/types/shop';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';

const CATEGORIES: Category[] = ['All', 'Tech', 'Fashion', 'Lifestyle', 'Accessories'];

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredProducts = activeCategory === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <section className="py-20 container mx-auto px-6" id="shop">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div>
          <h2 className="text-4xl font-headline font-bold mb-2">Discover Our <span className="text-gradient">Vault</span></h2>
          <p className="text-muted-foreground">Premium products curated for the modern era.</p>
        </div>

        <div className="flex flex-wrap gap-2 glass p-1 rounded-full border-white/5">
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant="ghost"
              className={`rounded-full px-6 transition-all duration-300 ${activeCategory === category ? 'bg-fuchsia-600 text-white glow-fuchsia' : 'hover:bg-white/5'}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
