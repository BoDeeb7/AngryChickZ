'use client';

import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Send, CreditCard, Wallet, Trash2, MapPin, User, Phone } from 'lucide-react';
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
    const orderItems = cart.map(item => (
      `• *${item.quantity}x ${item.name}* ($${(item.price * item.quantity).toFixed(2)})\n` +
      (item.notes ? `  _Note: ${item.notes}_\n` : '')
    )).join('\n');

    const message = encodeURIComponent(
      `🍔 *NEW ORDER - ANGRY CHICKZ* 🍔\n\n` +
      `*Customer Details:*\n` +
      `👤 Name: ${details.customerName}\n` +
      `📞 Phone: ${details.phoneNumber}\n` +
      `📍 Address: ${details.address}\n` +
      `💳 Payment: ${details.paymentMethod}\n\n` +
      `*Order Summary:*\n${orderItems}\n` +
      `💰 *Total Amount: $${subtotal.toFixed(2)}*\n\n` +
      `_Thank you for choosing Angry ChickZ!_`
    );

    window.open(`https://wa.me/70105152?text=${message}`, '_blank');
    clearCart();
    setCheckoutStep(1);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-full bg-[#0d0e12] border-l border-white/10 text-white">
        <SheetHeader className="p-8 border-b border-white/5">
          <SheetTitle className="flex items-center justify-between text-2xl font-bold text-white">
            Your Order
            <span className="text-xs font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10">{itemCount} items</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {checkoutStep === 1 ? (
            cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                <ShoppingBag className="h-24 w-24 mb-6 stroke-1" />
                <p className="text-xl font-bold">Your cart is empty</p>
                <p className="text-sm mt-2">Add some items to start your order.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map(item => (
                  <div key={item.id} className="space-y-4 pb-8 border-b border-white/5">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden glass-panel flex-shrink-0">
                        <Image src={item.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-grow py-0.5">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-lg text-white leading-tight">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-white/40 mb-3">${item.price.toFixed(2)} each</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center glass-panel rounded-xl p-0.5">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:text-red-500 transition-colors"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:text-red-500 transition-colors"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <span className="font-bold text-lg text-white">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <Input 
                      placeholder="Special instructions? (e.g. No onions)" 
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      className="h-10 text-xs bg-white/5 border-white/5 rounded-xl placeholder:text-white/20"
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" /> Full Name
                  </Label>
                  <Input className="rounded-xl h-12 bg-white/5 border-white/10 text-white font-medium" placeholder="Enter your name" value={details.customerName} onChange={e => setDetails(d => ({ ...d, customerName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="h-3 w-3" /> Phone Number
                  </Label>
                  <Input className="rounded-xl h-12 bg-white/5 border-white/10 text-white font-medium" placeholder="Enter your number" value={details.phoneNumber} onChange={e => setDetails(d => ({ ...d, phoneNumber: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Delivery Address
                  </Label>
                  <Textarea className="rounded-xl min-h-[100px] bg-white/5 border-white/10 text-white font-medium" placeholder="Enter full address" value={details.address} onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Payment Method</Label>
                <RadioGroup value={details.paymentMethod} onValueChange={(val: any) => setDetails(d => ({ ...d, paymentMethod: val }))} className="grid grid-cols-1 gap-3">
                  <Label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${details.paymentMethod === 'Cash on Delivery' ? 'border-red-600 bg-red-600/5' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-red-600" />
                      <span className="font-bold text-sm">Cash on Delivery</span>
                    </div>
                    <RadioGroupItem value="Cash on Delivery" className="sr-only" />
                  </Label>
                  <Label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${details.paymentMethod === 'Wish Money' ? 'border-red-600 bg-red-600/5' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-red-600" />
                      <span className="font-bold text-sm">Wish Money</span>
                    </div>
                    <RadioGroupItem value="Wish Money" className="sr-only" />
                  </Label>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t border-white/5 glass-panel space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-white/40 font-bold text-sm uppercase tracking-widest">Total Amount</span>
              <span className="text-3xl font-extrabold text-white">${subtotal.toFixed(2)}</span>
            </div>
            
            {checkoutStep === 1 ? (
              <Button 
                onClick={() => setCheckoutStep(2)} 
                className="w-full h-16 bg-red-600 hover:bg-red-700 rounded-2xl text-lg font-bold transition-all duration-300"
              >
                Checkout
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setCheckoutStep(1)} className="h-14 rounded-2xl font-bold border-white/10 hover:bg-white/5">Back</Button>
                <Button 
                  onClick={handleCheckout}
                  disabled={!details.customerName || !details.phoneNumber || !details.address}
                  className="h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-bold gap-2"
                >
                  <Send className="h-4 w-4" /> Order Now
                </Button>
              </div>
            )}
            <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em] font-medium">
              Secure Checkout via WhatsApp
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}