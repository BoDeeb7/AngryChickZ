
'use client';

import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Send, CreditCard, Wallet, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Image from 'next/image';
import { OrderDetails } from '@/types/restaurant';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, updateNotes, subtotal, itemCount, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [details, setDetails] = useState<OrderDetails>({
    customerName: '',
    phoneNumber: '',
    address: '',
    paymentMethod: 'Cash on Delivery'
  });

  const handleCheckout = () => {
    const orderText = cart.map(item => (
      `*${item.quantity}x ${item.name}*\n` +
      `Price: $${(item.price * item.quantity).toFixed(2)}\n` +
      (item.notes ? `Note: _${item.notes}_\n` : '')
    )).join('\n');

    const message = encodeURIComponent(
      `🔥 *NEW ANGRY CHICKZ ORDER* 🔥\n\n` +
      `👤 *Customer:* ${details.customerName}\n` +
      `📞 *Phone:* ${details.phoneNumber}\n` +
      `📍 *Address:* ${details.address}\n` +
      `💳 *Payment:* ${details.paymentMethod}\n\n` +
      `📦 *Order Details:*\n${orderText}\n` +
      `💰 *Total:* $${subtotal.toFixed(2)}\n\n` +
      `Please confirm my order!`
    );

    window.open(`https://wa.me/+1234567890?text=${message}`, '_blank');
    clearCart();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white">
        <SheetHeader className="p-6 border-b bg-red-600 text-white">
          <SheetTitle className="flex items-center justify-between text-2xl font-black uppercase italic text-white">
            Your Tray
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{itemCount} items</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {checkoutStep === 1 ? (
            cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                <ShoppingBag className="h-20 w-20 mb-4" />
                <p className="text-xl font-bold">Your tray is empty!</p>
                <p className="text-sm">Start adding some crunch.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="space-y-3 pb-6 border-b">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-muted">
                        <Image src={item.imageUrls[0] || 'https://picsum.photos/seed/food/100/100'} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black uppercase italic text-sm">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-muted rounded-full px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-red-600"><Minus className="h-3 w-3" /></button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-red-600"><Plus className="h-3 w-3" /></button>
                          </div>
                          <span className="font-black text-sm ml-auto">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <Textarea 
                      placeholder="Add special instructions (e.g., No pickles, Extra sauce...)" 
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      className="text-xs h-16 rounded-xl border-dashed bg-muted/20"
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider">Full Name</Label>
                <Input className="rounded-xl h-12" placeholder="John Doe" value={details.customerName} onChange={e => setDetails(d => ({ ...d, customerName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider">Phone Number</Label>
                <Input className="rounded-xl h-12" placeholder="012 345 6789" value={details.phoneNumber} onChange={e => setDetails(d => ({ ...d, phoneNumber: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider">Delivery Address</Label>
                <Textarea className="rounded-xl min-h-24" placeholder="Building, Floor, Apartment, Landmarks..." value={details.address} onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} />
              </div>
              <div className="space-y-4 pt-2">
                <Label className="font-bold text-xs uppercase tracking-wider">Payment Method</Label>
                <RadioGroup value={details.paymentMethod} onValueChange={(val: any) => setDetails(d => ({ ...d, paymentMethod: val }))} className="grid grid-cols-1 gap-4">
                  <Label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${details.paymentMethod === 'Cash on Delivery' ? 'border-red-600 bg-red-50' : 'border-muted bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-red-600" />
                      <span className="font-bold">Cash on Delivery</span>
                    </div>
                    <RadioGroupItem value="Cash on Delivery" />
                  </Label>
                  <Label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${details.paymentMethod === 'Wish Money' ? 'border-red-600 bg-red-50' : 'border-muted bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-red-600" />
                      <span className="font-bold">Wish Money</span>
                    </div>
                    <RadioGroupItem value="Wish Money" />
                  </Label>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-muted/10 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground font-bold uppercase text-xs tracking-wider">Total Amount</span>
              <span className="text-3xl font-black italic text-red-600">${subtotal.toFixed(2)}</span>
            </div>
            
            {checkoutStep === 1 ? (
              <Button 
                onClick={() => setCheckoutStep(2)} 
                className="w-full h-14 bg-red-600 hover:bg-red-700 rounded-2xl text-lg font-black italic uppercase tracking-tighter"
              >
                Checkout Now
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setCheckoutStep(1)} className="h-14 rounded-2xl font-bold">Back</Button>
                <Button 
                  onClick={handleCheckout}
                  disabled={!details.customerName || !details.phoneNumber || !details.address}
                  className="h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-black italic uppercase tracking-tighter gap-2"
                >
                  <Send className="h-5 w-5" /> Order via WA
                </Button>
              </div>
            )}
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              ⚡ Powered by Angry WA Checkout
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
