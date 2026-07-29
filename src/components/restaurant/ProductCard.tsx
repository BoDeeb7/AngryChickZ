
'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Added to Tray!",
      description: `${product.name} ready for the crunch.`,
    });
  };

  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden border border-border/50 hover:border-red-600/20 transition-all duration-500 hover:shadow-2xl hover:shadow-red-600/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        <Image 
          src={product.imageUrls[0] || 'https://picsum.photos/seed/food/400/300'} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.badges.map((badge, idx) => (
            <Badge key={idx} className={`${badge === 'Spicy' ? 'bg-red-600' : 'bg-yellow-400 text-black'} border-none px-3 py-1 font-bold text-[10px] uppercase tracking-widest`}>
              {badge === 'Spicy' && <Flame className="h-3 w-3 mr-1 fill-white" />}
              {badge}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black italic tracking-tight group-hover:text-red-600 transition-colors uppercase">{product.name}</h3>
          <span className="text-xl font-black text-red-600">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
          {product.description}
        </p>
        <Button 
          onClick={handleAdd}
          className="w-full h-12 rounded-2xl bg-black hover:bg-red-600 text-white font-bold transition-all gap-2"
        >
          <ShoppingBag className="h-4 w-4" /> Add to Order
        </Button>
      </div>
    </div>
  );
}
