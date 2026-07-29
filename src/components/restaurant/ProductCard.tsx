
'use client';

import { Product } from '@/types/restaurant';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} is waiting for you.`,
      className: "bg-red-600 border-none text-white font-bold",
    });
  };

  const mainImage = product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=800&h=800&auto=format&fit=crop';

  return (
    <div className="group glass-card rounded-3xl overflow-hidden flex flex-col h-full hover:translate-y-[-8px] transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.badges?.map((badge, idx) => (
            <Badge key={idx} className="bg-red-600 border-none px-3 py-1 font-bold text-[9px] uppercase tracking-wider rounded-full shadow-lg">
              {badge}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors leading-tight flex-grow pr-2">
            {product.name}
          </h3>
          <span className="text-xl font-extrabold text-white tracking-tight">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-white/50 line-clamp-2 mb-6 font-medium leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <Button 
            onClick={handleAdd}
            className="w-full h-14 rounded-2xl bg-white text-black hover:bg-red-600 hover:text-white font-bold transition-all duration-300 gap-2 shadow-lg"
          >
            <ShoppingBag className="h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
