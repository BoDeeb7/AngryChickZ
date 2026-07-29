'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, ChefHat } from 'lucide-react';

export function MenuGrid() {
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState('All');

  const productsRef = useMemo(() => db ? query(collection(db, 'products'), orderBy('createdAt', 'desc')) : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);

  const { data: products = [], loading: productsLoading } = useCollection<Product>(productsRef);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <section id="menu" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-red-600">
               <Flame className="h-6 w-6 fill-red-600" />
               <span className="font-black uppercase tracking-[0.4em] text-xs">The Collection</span>
            </div>
            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase italic text-white leading-none">
              Signature <br /> <span className="text-glow-red text-red-600">Menu</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 glass-panel p-2 rounded-[2rem]">
            <Button
              variant={activeTab === 'All' ? 'default' : 'ghost'}
              className={`rounded-2xl px-10 h-14 font-black uppercase italic tracking-tighter text-lg transition-all ${activeTab === 'All' ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              onClick={() => setActiveTab('All')}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeTab === cat.slug ? 'default' : 'ghost'}
                className={`rounded-2xl px-10 h-14 font-black uppercase italic tracking-tighter text-lg transition-all ${activeTab === cat.slug ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveTab(cat.slug)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card rounded-[2.5rem] p-4 space-y-6">
                <Skeleton className="aspect-square rounded-[2rem] bg-white/5" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-10 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-16 w-full rounded-2xl bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 glass-card rounded-[4rem] border-dashed">
            <ChefHat className="h-24 w-24 mx-auto mb-8 text-white/20" />
            <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4">Under Development</h3>
            <p className="text-white/40 font-medium">Our master chefs are currently refining the recipes for this section.</p>
          </div>
        )}
      </div>
    </section>
  );
}