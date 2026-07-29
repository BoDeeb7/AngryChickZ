'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Flame, Star, Sparkles, Plus } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Added to Order",
      description: `${product.name} is in the basket.`,
      className: "bg-primary border-none text-white font-black uppercase text-xs tracking-widest",
    });
  };

  const mainImage = product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="group glass-card rounded-[3rem] p-4 flex flex-col h-full hover:border-primary/30">
      <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-6">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.badges?.map((badge, idx) => (
            <Badge key={idx} className="bg-white/90 backdrop-blur-md text-primary border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
               {badge.toLowerCase().includes('spicy') ? <Flame className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
               {badge}
            </Badge>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-amber-600 font-black text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-500" /> 4.9
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-3 mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{product.category.replace('-', ' ')}</span>
            <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight uppercase italic tracking-tighter">
              {product.name}
            </h3>
          </div>
          <span className="text-2xl font-black text-primary italic tracking-tighter whitespace-nowrap">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-8 font-medium leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <Button 
            onClick={handleAdd}
            className="w-full h-16 rounded-full bg-foreground text-white hover:bg-primary font-black transition-all duration-500 gap-3 shadow-xl uppercase italic group/btn"
          >
            <Plus className="h-5 w-5 group-hover/btn:rotate-90 transition-transform" /> Add to Order
          </Button>
        </div>
      </div>
    </div>
  );
}