'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Sparkles, Plus } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Added to Basket",
      description: `${product.name} ready for checkout.`,
      className: "bg-zinc-900 border-zinc-800 text-zinc-100",
    });
  };

  const mainImage = product.imageUrls?.[0] || 'https://picsum.photos/seed/food/800/800';

  return (
    <div className="group bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 flex flex-col h-full hover:border-zinc-700 transition-all duration-300 shadow-lg will-change-transform transform-gpu">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-zinc-800 will-change-transform">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
          {product.badges?.slice(0, 1).map((badge, idx) => (
            <Badge key={idx} className="bg-zinc-950/80 backdrop-blur-md text-amber-500 border-none px-3 py-1 font-bold text-[8px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
               {badge.toLowerCase().includes('spicy') ? <Flame className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
               {badge}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex flex-col mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
            {product.category.replace('-', ' ')}
          </span>
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-amber-500 transition-colors leading-tight italic uppercase tracking-tighter">
            {product.name}
          </h3>
        </div>
        
        <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-medium">
          {product.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between gap-4">
          <span className="text-xl font-bold text-amber-400 italic">
            ${product.price.toFixed(2)}
          </span>
          <Button 
            onClick={handleAdd}
            size="sm"
            className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black transition-all gap-2 active:scale-90"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}