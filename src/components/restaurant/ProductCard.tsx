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
    <div className="group glass-card rounded-[2rem] md:rounded-[4rem] p-3 md:p-6 flex flex-col h-full hover:border-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(225,29,72,0.15)] transition-all duration-700 w-full overflow-hidden">
      <div className="relative aspect-square rounded-[1.5rem] md:rounded-[3.5rem] overflow-hidden mb-3 md:mb-8 shadow-xl md:shadow-2xl">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 md:top-6 md:left-6 flex flex-col gap-1.5 md:gap-3 z-10">
          {product.badges?.slice(0, 1).map((badge, idx) => (
            <Badge key={idx} className="bg-background/80 backdrop-blur-xl text-primary border-none px-2 md:px-5 py-1 md:py-2 font-black text-[7px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-full shadow-lg flex items-center gap-1 md:gap-2">
               {badge.toLowerCase().includes('spicy') ? <Flame className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" /> : <Sparkles className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />}
               {badge}
            </Badge>
          ))}
        </div>
        <div className="absolute bottom-2 right-2 md:bottom-6 md:right-6 z-10">
          <div className="bg-background/80 backdrop-blur-xl px-2 md:px-4 py-1 rounded-full flex items-center gap-1 md:gap-2 text-secondary font-black text-[8px] md:text-[11px] shadow-lg">
            <Star className="h-2.5 w-2.5 md:h-4 md:w-4 fill-secondary" /> 4.9
          </div>
        </div>
      </div>

      <div className="px-1 md:px-2 pb-1 md:pb-2 flex flex-col flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start gap-1 md:gap-4 mb-2 md:mb-6">
          <div className="overflow-hidden w-full">
            <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary/40 block mb-0.5 md:mb-2 truncate">{product.category.replace('-', ' ')}</span>
            <h3 className="text-sm md:text-3xl font-black text-foreground group-hover:text-primary transition-colors leading-tight md:leading-[1.1] uppercase italic tracking-tighter truncate">
              {product.name}
            </h3>
          </div>
          <span className="text-sm md:text-3xl font-black text-foreground italic tracking-tighter whitespace-nowrap bg-primary/5 px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-2xl">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-[9px] md:text-[13px] text-foreground/40 line-clamp-2 mb-4 md:mb-10 font-bold uppercase tracking-tight md:tracking-wide leading-tight md:leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <Button 
            onClick={handleAdd}
            className="w-full h-10 md:h-20 rounded-xl md:rounded-[2rem] bg-foreground text-background hover:bg-primary hover:text-white font-black transition-all duration-700 gap-1 md:gap-4 shadow-lg md:shadow-xl uppercase italic group/btn overflow-hidden relative text-[9px] md:text-base"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 md:h-6 md:w-6 group-hover/btn:rotate-90 transition-transform duration-500" /> 
              Add
            </span>
            <div className="absolute inset-0 bg-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700" />
          </Button>
        </div>
      </div>
    </div>
  );
}
