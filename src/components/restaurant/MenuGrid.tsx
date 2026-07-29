
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Product, Category } from '@/types/restaurant';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Flame, ChefHat, RefreshCw, Loader2 } from 'lucide-react';
import { MOCK_DATA } from '@/lib/mock-data';

export function MenuGrid() {
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState('All');

  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);

  const { data: dbProducts = [], loading: productsLoading } = useCollection<Product>(productsRef);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);

  // Merge Firestore data with Mock data for instant display
  const allProducts = useMemo(() => {
    // Convert MOCK_DATA items to the full Product interface if needed
    const mockItems = MOCK_DATA as unknown as Product[];
    const combined = [...dbProducts];
    
    // Only add mock items if Firestore is empty or for initial richness
    if (dbProducts.length === 0) {
      return mockItems;
    }
    
    return combined;
  }, [dbProducts]);

  const displayProducts = useMemo(() => {
    let list = [...allProducts];
    list.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });

    if (activeTab === 'All') return list;
    return list.filter(p => p.category === activeTab);
  }, [allProducts, activeTab]);

  return (
    <section id="menu" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-red-600">
               <Flame className="h-6 w-6 fill-red-600 animate-pulse" />
               <span className="font-black uppercase tracking-[0.4em] text-xs">The Heat Inventory</span>
            </div>
            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase italic text-white leading-none">
              Signature <br /> <span className="text-glow-red text-red-600">Assets</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 glass-panel p-2 rounded-[2.5rem]">
            <Button
              variant={activeTab === 'All' ? 'default' : 'ghost'}
              className={`rounded-3xl px-10 h-16 font-black uppercase italic tracking-tighter text-lg transition-all duration-300 ${activeTab === 'All' ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              onClick={() => setActiveTab('All')}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeTab === cat.slug ? 'default' : 'ghost'}
                className={`rounded-3xl px-10 h-16 font-black uppercase italic tracking-tighter text-lg transition-all duration-300 ${activeTab === cat.slug ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveTab(cat.slug)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {displayProducts.map(product => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-white/10">
            {productsLoading ? (
              <Loader2 className="h-24 w-24 mx-auto mb-8 text-red-600 animate-spin" />
            ) : (
              <>
                <ChefHat className="h-24 w-24 mx-auto mb-8 text-white/20" />
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4">Under Development</h3>
                <p className="text-white/40 font-medium">Our master chefs are currently refining the recipes for this sector.</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
