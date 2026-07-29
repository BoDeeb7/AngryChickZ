'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Plus, ShoppingBag, Zap } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Added to Order!",
      description: `${product.name} is on your tray.`,
    });
  };

  return (
    <div className="group glass-card rounded-[2.5rem] overflow-hidden">
      <div className="relative aspect-[1/1] overflow-hidden p-4">
        <div className="relative h-full w-full rounded-[2rem] overflow-hidden">
          <Image 
            src={product.imageUrls[0] || 'https://picsum.photos/seed/food/600/600'} 
            alt={product.name} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>
        
        <div className="absolute top-8 left-8 flex flex-col gap-2 z-10">
          {product.badges.map((badge, idx) => (
            <Badge key={idx} className={`${badge === 'Spicy' ? 'bg-red-600' : 'bg-yellow-400 text-black'} border-none px-4 py-1.5 font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg`}>
              {badge === 'Spicy' && <Flame className="h-3 w-3 mr-1 fill-white" />}
              {badge}
            </Badge>
          ))}
        </div>

        <div className="absolute bottom-8 right-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
           <div className="bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
           </div>
        </div>
      </div>

      <div className="p-8 pt-2">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-black italic tracking-tighter text-white group-hover:text-red-500 transition-colors uppercase leading-tight">
            {product.name}
          </h3>
          <span className="text-2xl font-black text-white italic tracking-tighter text-glow-red">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-white/50 line-clamp-2 mb-8 font-medium">
          {product.description}
        </p>
        
        <Button 
          onClick={handleAdd}
          className="w-full h-16 rounded-3xl bg-white text-black hover:bg-red-600 hover:text-white font-black uppercase italic tracking-tighter text-lg transition-all gap-3 btn-glow-red"
        >
          <ShoppingBag className="h-5 w-5" /> Add to Order
        </Button>
      </div>
    </div>
  );
}