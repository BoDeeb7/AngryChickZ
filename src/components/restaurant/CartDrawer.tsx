'use client';

import { useState, useMemo } from 'react';
import { X, Minus, Plus, ShoppingBag, Send, CreditCard, Wallet, Trash2, MapPin, User, Phone, Eraser } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Image from 'next/image';
import { OrderDetails, StoreSettings } from '@/types/restaurant';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, updateNotes, subtotal, itemCount, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [details, setDetails] = useState<OrderDetails>({
    customerName: '',
    phoneNumber: '',
    address: '',
    paymentMethod: 'Cash on Delivery'
  });
  const [orderInstructions, setOrderInstructions] = useState('');

  const db = useFirestore();
  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);
  const { data: storeSettings } = useDoc<StoreSettings>(storeSettingsRef);

  const handleCheckout = () => {
    const orderItems = cart.map(item => (
      `• *${item.quantity}x ${item.name}* ($${(item.price * item.quantity).toFixed(2)})\n` +
      (item.notes ? `  _Item Note: ${item.notes}_\n` : '')
    )).join('\n');

    const whatsappNumber = storeSettings?.whatsappNumber || '70105152';

    const message = encodeURIComponent(
      `🍗 *NEW ORDER: ANGRY CHICKZ* 🍗\n\n` +
      `*CUSTOMER DETAILS:*\n` +
      `👤 Name: ${details.customerName}\n` +
      `📞 Phone: ${details.phoneNumber}\n` +
      `📍 Address: ${details.address}\n\n` +
      `*ORDER SUMMARY:*\n${orderItems}\n` +
      (orderInstructions ? `📝 *Order Instructions:* ${orderInstructions}\n\n` : '') +
      `💰 *Total Amount: $${subtotal.toFixed(2)}*\n` +
      `💳 *Payment Method:* ${details.paymentMethod}\n\n` +
      `_Formatted via Angry ChickZ Digital Release_`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    clearCart();
    setCheckoutStep(1);
    setOrderInstructions('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-[#FFFBEB] border-l border-amber-500/10 text-foreground">
        <SheetHeader className="p-8 border-b border-amber-500/5 bg-white/40 glass-card">
          <SheetTitle className="flex items-center justify-between text-2xl font-black uppercase italic tracking-tighter">
            Your Basket
            <span className="text-[10px] font-black bg-primary text-white px-4 py-1.5 rounded-full shadow-lg">{itemCount} ITEMS</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {checkoutStep === 1 ? (
            cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
                <ShoppingBag className="h-24 w-24 mb-6 stroke-1" />
                <p className="text-xl font-black uppercase italic">Basket Empty</p>
                <p className="text-xs mt-2 font-bold uppercase tracking-widest">Add some heat to start</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Review Items</h3>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2">
                    <Eraser className="h-3 w-3" /> Clear All
                  </Button>
                </div>
                {cart.map(item => (
                  <div key={item.id} className="space-y-4 pb-8 border-b border-amber-500/5 animate-in slide-in-from-right-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden glass-card shadow-lg flex-shrink-0">
                        <Image src={item.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-grow py-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-black text-lg text-foreground italic tracking-tighter uppercase">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-foreground/10 hover:text-primary transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-foreground/40 mb-3">${item.price.toFixed(2)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-white border border-amber-500/10 rounded-xl p-0.5">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:text-primary transition-colors"><Minus className="h-3 w-3" /></button>
                            <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:text-primary transition-colors"><Plus className="h-3 w-3" /></button>
                          </div>
                          <span className="font-black text-lg italic tracking-tighter text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="space-y-4 pt-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Order Instructions</Label>
                   <Textarea 
                      placeholder="Any specific requests for the kitchen?" 
                      value={orderInstructions}
                      onChange={(e) => setOrderInstructions(e.target.value)}
                      className="bg-white border-amber-500/10 rounded-2xl min-h-[80px] text-xs font-bold"
                   />
                </div>
              </div>
            )
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" /> Full Name
                  </Label>
                  <Input className="rounded-2xl h-14 bg-white border-amber-500/10 font-bold" placeholder="Your Name" value={details.customerName} onChange={e => setDetails(d => ({ ...d, customerName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="h-3 w-3" /> Phone Number
                  </Label>
                  <Input className="rounded-2xl h-14 bg-white border-amber-500/10 font-bold" placeholder="WhatsApp Number" value={details.phoneNumber} onChange={e => setDetails(d => ({ ...d, phoneNumber: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Delivery Address
                  </Label>
                  <Textarea className="rounded-2xl min-h-[100px] bg-white border-amber-500/10 font-bold" placeholder="Street, Building, Floor" value={details.address} onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-amber-500/5">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Payment Method</Label>
                <RadioGroup value={details.paymentMethod} onValueChange={(val: any) => setDetails(d => ({ ...d, paymentMethod: val }))} className="grid grid-cols-1 gap-3">
                  <Label className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${details.paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5 shadow-inner' : 'border-amber-500/10 bg-white'}`}>
                    <div className="flex items-center gap-4">
                      <CreditCard className={`h-5 w-5 ${details.paymentMethod === 'Cash on Delivery' ? 'text-primary' : 'text-foreground/20'}`} />
                      <span className="font-black text-sm uppercase italic">Cash on Delivery</span>
                    </div>
                    <RadioGroupItem value="Cash on Delivery" className="sr-only" />
                  </Label>
                  <Label className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${details.paymentMethod === 'Wish Money' ? 'border-primary bg-primary/5 shadow-inner' : 'border-amber-500/10 bg-white'}`}>
                    <div className="flex items-center gap-4">
                      <Wallet className={`h-5 w-5 ${details.paymentMethod === 'Wish Money' ? 'text-primary' : 'text-foreground/20'}`} />
                      <span className="font-black text-sm uppercase italic">Wish Money</span>
                    </div>
                    <RadioGroupItem value="Wish Money" className="sr-only" />
                  </Label>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t border-amber-500/10 glass-card space-y-6 bg-white/60">
            <div className="flex justify-between items-center">
              <span className="text-foreground/40 font-black text-[10px] uppercase tracking-[0.2em]">Total Bill</span>
              <span className="text-3xl font-black italic tracking-tighter text-primary">${subtotal.toFixed(2)}</span>
            </div>
            
            {checkoutStep === 1 ? (
              <Button 
                onClick={() => setCheckoutStep(2)} 
                className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl text-lg font-black uppercase italic shadow-lg"
              >
                Proceed to Details
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setCheckoutStep(1)} className="h-16 rounded-2xl font-black uppercase italic border-amber-500/20">Back</Button>
                <Button 
                  onClick={handleCheckout}
                  disabled={!details.customerName || !details.phoneNumber || !details.address}
                  className="h-16 bg-green-600 hover:bg-green-700 rounded-2xl font-black uppercase italic gap-3 shadow-lg"
                >
                  <Send className="h-5 w-5" /> Secure Order
                </Button>
              </div>
            )}
            <p className="text-[9px] text-center text-foreground/20 uppercase tracking-[0.3em] font-black">
              Verified Checkout • SSL Secured
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
