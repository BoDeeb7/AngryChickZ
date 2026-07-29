'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Sparkles, Plus } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Item Secured",
      description: `${product.name} added to your selection.`,
      className: "glass-card border-primary/20 text-foreground font-black uppercase text-[10px] tracking-widest",
    });
  };

  const mainImage = product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="group glass-card rounded-[4rem] p-6 flex flex-col h-full hover:border-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(225,29,72,0.15)] transition-all duration-700">
      <div className="relative aspect-[1/1] rounded-[3.5rem] overflow-hidden mb-8 shadow-2xl">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-115"
        />
        <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
          {product.badges?.map((badge, idx) => (
            <Badge key={idx} className="bg-background/80 backdrop-blur-xl text-primary border-none px-5 py-2 font-black text-[10px] uppercase tracking-[0.2em] rounded-full shadow-xl flex items-center gap-2">
               {badge.toLowerCase().includes('spicy') ? <Flame className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
               {badge}
            </Badge>
          ))}
        </div>
        <div className="absolute bottom-6 right-6 z-10">
          <div className="bg-background/80 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 text-secondary font-black text-[11px] shadow-xl">
            <Star className="h-4 w-4 fill-secondary" /> 4.9
          </div>
        </div>
      </div>

      <div className="px-2 pb-2 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 block mb-2">{product.category.replace('-', ' ')}</span>
            <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors leading-[1.1] uppercase italic tracking-tighter">
              {product.name}
            </h3>
          </div>
          <span className="text-3xl font-black text-foreground italic tracking-tighter whitespace-nowrap bg-primary/5 px-4 py-2 rounded-2xl">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-[13px] text-foreground/40 line-clamp-2 mb-10 font-bold uppercase tracking-wide leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <Button 
            onClick={handleAdd}
            className="w-full h-20 rounded-[2rem] bg-foreground text-background hover:bg-primary hover:text-white font-black transition-all duration-700 gap-4 shadow-xl uppercase italic group/btn overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Plus className="h-6 w-6 group-hover/btn:rotate-90 transition-transform duration-500" /> 
              Add to Basket
            </span>
            <div className="absolute inset-0 bg-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700" />
          </Button>
        </div>
      </div>
    </div>
  );
}