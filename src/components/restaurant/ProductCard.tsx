'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Flame, Star, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Added to Order",
      description: `${product.name} has been staged for delivery.`,
      className: "bg-red-600 border-none text-white font-black uppercase text-xs tracking-widest",
    });
  };

  const mainImage = product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=800&h=800&auto=format&fit=crop';

  return (
    <div className="group glass-card rounded-[2.5rem] overflow-hidden flex flex-col h-full hover:translate-y-[-12px] transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(220,38,38,0.3)] border-white/5">
      <div className="relative aspect-square overflow-hidden">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
          {product.badges?.map((badge, idx) => (
            <Badge key={idx} className="bg-red-600 text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-2xl flex items-center gap-2">
               {badge.toLowerCase().includes('spicy') ? <Flame className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
               {badge}
            </Badge>
          ))}
        </div>

        <div className="absolute bottom-6 right-6 z-10">
          <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2 text-amber-500 font-black text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-500" /> 4.9
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-red-600/5 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col gap-2 mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/60">Executive Selection</span>
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-2xl font-black text-white group-hover:text-red-600 transition-colors leading-[1.1] uppercase italic tracking-tighter">
              {product.name}
            </h3>
            <span className="text-2xl font-black text-white italic tracking-tighter">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-white/30 line-clamp-2 mb-8 font-bold uppercase tracking-tight leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <Button 
            onClick={handleAdd}
            className="w-full h-16 rounded-[1.5rem] bg-white text-black hover:bg-red-600 hover:text-white font-black transition-all duration-500 gap-3 shadow-2xl uppercase italic text-sm group/btn"
          >
            <ShoppingBag className="h-5 w-5 group-hover/btn:scale-110 transition-transform" /> Add to Order
          </Button>
        </div>
      </div>
    </div>
  );
}