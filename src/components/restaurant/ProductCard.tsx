'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Sparkles, Plus } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, formatPrice } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "تمت الإضافة للسلة",
      description: `${product.name} جاهز للطلب.`,
      className: "bg-zinc-900 border-zinc-800 text-zinc-100",
    });
  };

  const mainImage = product.imageUrls?.[0] || 'https://picsum.photos/seed/food/800/800';

  return (
    <div className="group bg-zinc-900/95 border border-zinc-800/50 rounded-2xl p-3 md:p-4 flex flex-col h-full hover:border-amber-500/30 transition-all duration-300 shadow-xl overflow-hidden relative">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-800">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 48vw, 25vw"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.badges?.slice(0, 1).map((badge, idx) => (
            <Badge key={idx} className="bg-black/70 backdrop-blur-md text-amber-500 border-none px-2 py-0.5 font-bold text-[7px] uppercase tracking-widest rounded-full flex items-center gap-1">
               {badge.toLowerCase().includes('spicy') ? <Flame className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
               {badge}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500/60 block mb-1">
            {product.category.replace('-', ' ')}
          </span>
          <h3 className="text-sm md:text-lg font-black text-zinc-100 group-hover:text-amber-500 transition-colors leading-tight italic uppercase tracking-tighter line-clamp-1">
            {product.name}
          </h3>
        </div>
        
        <p className="text-[10px] text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-medium flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-zinc-800/50">
          <span className="text-sm md:text-lg font-black text-amber-500 italic">
            {formatPrice(product.price)}
          </span>
          <Button 
            onClick={handleAdd}
            size="sm"
            className="h-8 md:h-10 px-3 md:px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black transition-all gap-1.5 active:scale-90 text-[10px] md:text-xs uppercase italic"
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
