'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, Utensils } from 'lucide-react';
import { MOCK_DATA } from '@/lib/mock-data';

const CATEGORIES = [
  { name: 'All', slug: 'all' },
  { name: 'Burgers', slug: 'burgers' },
  { name: 'Crispy Tenders', slug: 'crispy-tenders' },
  { name: 'Sides', slug: 'sides' },
  { name: 'Drinks', slug: 'drinks' },
];

export function MenuGrid() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('all');

  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const { data: dbProducts = [], loading: productsLoading } = useCollection<Product>(productsRef);

  const displayProducts = useMemo(() => {
    const combined = dbProducts.length > 0 ? dbProducts : (MOCK_DATA as unknown as Product[]);
    if (activeCategory === 'all') return combined;
    return combined.filter(p => p.category === activeCategory);
  }, [dbProducts, activeCategory]);

  return (
    <section id="menu" className="py-32 relative bg-white/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-20 gap-6">
          <div className="space-y-4">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[11px]">Hand-Crafted Goodness</span>
            <h2 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter uppercase italic">Our Signature Menu</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 p-2 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/10">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.slug}
                variant={activeCategory === cat.slug ? 'default' : 'ghost'}
                className={`rounded-full px-8 h-12 font-black uppercase text-[11px] tracking-widest transition-all ${
                  activeCategory === cat.slug 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-foreground/40 hover:text-primary'
                }`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {productsLoading && dbProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="text-sm font-black uppercase tracking-widest">Preparing the menu...</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card rounded-[3rem] border-dashed border-amber-500/20">
            <Utensils className="h-16 w-16 mx-auto mb-6 text-foreground/10" />
            <h3 className="text-2xl font-black text-foreground mb-2 uppercase italic">No Items Found</h3>
            <p className="text-muted-foreground font-medium">We are currently updating this section.</p>
          </div>
        )}
      </div>
    </section>
  );
}