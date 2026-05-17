
"use client";

import { X, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const FREE_SHIPPING_THRESHOLD = 500;

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();
  
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md glass border-l border-white/10 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-white/10">
          <SheetTitle className="flex items-center justify-between font-headline font-bold text-2xl">
            Shopping Cart
            <span className="text-sm font-body font-normal text-muted-foreground">({itemCount} items)</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {subtotal > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-fuchsia-500" />
                  {remainingForFreeShipping > 0 
                    ? `Spend $${remainingForFreeShipping.toFixed(2)} more for free shipping`
                    : "You've earned free shipping!"}
                </span>
              </div>
              <Progress value={shippingProgress} className="h-1.5 bg-white/5" />
            </div>
          )}

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <ShoppingBag className="h-16 w-16" />
              <p className="text-lg">Your cart is empty</p>
              <Button onClick={onClose} variant="outline" className="rounded-full border-white/10">Start Shopping</Button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-white/5">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-bold text-sm leading-tight group-hover:text-fuchsia-400 transition-colors">{item.name}</h4>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">${item.price.toFixed(2)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-white/5 rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-fuchsia-500 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-fuchsia-500 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 glass bg-white/[0.02] space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Shipping</span>
              <span className="text-white font-bold">{subtotal > FREE_SHIPPING_THRESHOLD ? 'FREE' : '$25.00'}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2">
              <span>Total</span>
              <span className="text-gradient">${(subtotal + (subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 25)).toFixed(2)}</span>
            </div>
            <Button className="w-full h-12 bg-fuchsia-600 hover:bg-fuchsia-700 glow-fuchsia rounded-full text-lg font-bold">
              Secure Checkout
            </Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
              Powered by Velozi Pay &bull; Secure Encrypted Payments
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
