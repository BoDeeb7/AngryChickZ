
"use client";

import { Product } from '@/types/shop';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} is now in your shopping cart.`,
    });
  };

  return (
    <div className="group relative flex flex-col glass rounded-2xl overflow-hidden border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(217,70,239,0.2)]">
      <div className="relative aspect-[4/5] overflow-hidden">
        {product.badge && (
          <Badge className="absolute top-4 left-4 z-10 bg-fuchsia-600 border-none px-3 py-1 font-headline">
            {product.badge}
          </Badge>
        )}
        <Image 
          src={product.imageUrl} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint={product.tags.join(' ')}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
          <Button 
            onClick={handleAdd}
            className="w-full bg-white text-black hover:bg-fuchsia-500 hover:text-white rounded-full font-bold transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
            disabled={product.status === 'Out of Stock'}
          >
            {product.status === 'Out of Stock' ? 'Sold Out' : 'Quick Add'}
          </Button>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-widest text-fuchsia-500 font-bold">{product.category}</span>
          <span className={`text-[10px] font-bold ${product.status === 'In Stock' ? 'text-green-500' : product.status === 'Low Stock' ? 'text-yellow-500' : 'text-red-500'}`}>
            {product.status}
          </span>
        </div>
        <h3 className="font-headline font-bold text-lg mb-1 group-hover:text-fuchsia-400 transition-colors line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-grow">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleAdd}
            className="h-8 w-8 rounded-full border border-white/10 hover:bg-fuchsia-500/20 hover:text-fuchsia-400"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
