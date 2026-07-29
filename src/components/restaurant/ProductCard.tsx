
'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Plus, ShoppingBag, Zap, Star } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "ASSET DEPLOYED",
      description: `${product.name} ADDED TO TRAY.`,
      className: "bg-red-600 border-none text-white font-black uppercase italic tracking-tighter",
    });
  };

  const mainImage = product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=800&h=800&auto=format&fit=crop';

  return (
    <div className="group glass-card rounded-[3rem] overflow-hidden flex flex-col h-full hover:shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)]">
      <div className="relative aspect-square overflow-hidden p-6">
        <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden">
          <Image 
            src={mainImage} 
            alt={product.name} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
        </div>
        
        <div className="absolute top-10 left-10 flex flex-col gap-3 z-10">
          {product.badges?.map((badge, idx) => (
            <Badge key={idx} className={`${badge === 'Spicy' ? 'bg-red-600' : 'bg-yellow-400 text-black'} border-none px-5 py-2 font-black text-[10px] uppercase tracking-[0.2em] rounded-full shadow-2xl animate-in zoom-in-50 duration-500`}>
              {badge === 'Spicy' && <Flame className="h-3 w-3 mr-2 fill-white animate-pulse" />}
              {badge}
            </Badge>
          ))}
        </div>

        <div className="absolute bottom-10 right-10 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
           <div className="bg-red-600 p-4 rounded-3xl shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              <Zap className="h-6 w-6 text-white fill-white animate-pulse" />
           </div>
        </div>
      </div>

      <div className="p-10 pt-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-3xl font-black italic tracking-tighter text-white group-hover:text-red-500 transition-colors uppercase leading-[0.9] flex-grow pr-4">
            {product.name}
          </h3>
          <span className="text-3xl font-black text-white italic tracking-tighter text-glow-red shrink-0">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-base text-white/40 line-clamp-2 mb-10 font-medium leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <Button 
            onClick={handleAdd}
            className="w-full h-20 rounded-[2rem] bg-white text-black hover:bg-red-600 hover:text-white font-black uppercase italic tracking-tighter text-xl transition-all duration-500 gap-4 btn-glow-red"
          >
            <ShoppingBag className="h-6 w-6" /> Add to Tray
          </Button>
        </div>
      </div>
    </div>
  );
}
