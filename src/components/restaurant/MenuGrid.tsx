
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils } from 'lucide-react';

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
    <section id="menu" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">
              Our <span className="text-red-600">Legendary</span> Menu
            </h2>
            <p className="text-muted-foreground max-w-md text-lg">
              Fresh ingredients, secret spices, and zero mercy for hunger.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'All' ? 'default' : 'outline'}
              className={`rounded-full px-8 h-12 font-bold ${activeTab === 'All' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={() => setActiveTab('All')}
            >
              All Items
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeTab === cat.slug ? 'default' : 'outline'}
                className={`rounded-full px-8 h-12 font-bold ${activeTab === cat.slug ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => setActiveTab(cat.slug)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] rounded-[2rem]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed">
            <Utensils className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-20" />
            <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
            <p className="text-muted-foreground">We are cooking up something spicy for this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
