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
    const orderText = cart.map(item => (
      `🔥 *${item.quantity}x ${item.name}*\n` +
      `Price: $${(item.price * item.quantity).toFixed(2)}\n` +
      (item.notes ? `Note: _${item.notes}_\n` : '')
    )).join('\n');

    const message = encodeURIComponent(
      `🦅 *ANGRY CHICKZ PREMIUM ORDER* 🦅\n\n` +
      `👤 *VIP:* ${details.customerName}\n` +
      `📞 *Contact:* ${details.phoneNumber}\n` +
      `📍 *Location:* ${details.address}\n` +
      `💳 *Payment:* ${details.paymentMethod}\n\n` +
      `📦 *The Tray:*\n${orderText}\n` +
      `💰 *Total Amount:* $${subtotal.toFixed(2)}\n\n` +
      `⚡ _Initiating delivery sequence..._`
    );

    window.open(`https://wa.me/70105152?text=${message}`, '_blank');
    clearCart();
    setCheckoutStep(1);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-full bg-[#050505] border-l border-white/10 text-white">
        <SheetHeader className="p-10 border-b border-white/10 bg-white/5">
          <SheetTitle className="flex items-center justify-between text-3xl font-black uppercase italic text-white tracking-tighter">
            Your Tray
            <span className="text-xs font-black bg-red-600 px-4 py-1.5 rounded-full border border-white/20">{itemCount} items</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {checkoutStep === 1 ? (
            cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
                <ShoppingBag className="h-32 w-32 mb-8 stroke-1" />
                <p className="text-2xl font-black uppercase italic tracking-tighter">Tray is Empty</p>
                <p className="text-sm font-medium">Add some heat to continue.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {cart.map(item => (
                  <div key={item.id} className="space-y-6 pb-10 border-b border-white/5 group">
                    <div className="flex gap-6">
                      <div className="relative h-28 w-28 rounded-3xl overflow-hidden glass-panel flex-shrink-0">
                        <Image src={item.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-grow py-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black uppercase italic text-xl tracking-tighter group-hover:text-red-500 transition-colors leading-none">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-600 transition-colors p-1">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-xs font-black text-white/40 tracking-widest uppercase mb-4">${item.price.toFixed(2)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center glass-panel rounded-2xl p-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:text-red-600 transition-colors"><Minus className="h-4 w-4" /></button>
                            <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:text-red-600 transition-colors"><Plus className="h-4 w-4" /></button>
                          </div>
                          <span className="font-black text-xl italic tracking-tighter text-glow-red">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <Textarea 
                      placeholder="Special instructions? (e.g. EXTRA SAUCE, NO ONIONS)" 
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      className="text-xs font-bold bg-white/5 border-white/10 rounded-2xl h-20 uppercase tracking-widest placeholder:text-white/20"
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                    <User className="h-3 w-3" /> Full Name
                  </Label>
                  <Input className="rounded-2xl h-16 bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-lg px-6" placeholder="JOHN DOE" value={details.customerName} onChange={e => setDetails(d => ({ ...d, customerName: e.target.value }))} />
                </div>
                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                    <Phone className="h-3 w-3" /> Contact Phone
                  </Label>
                  <Input className="rounded-2xl h-16 bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-lg px-6" placeholder="+123 456 7890" value={details.phoneNumber} onChange={e => setDetails(d => ({ ...d, phoneNumber: e.target.value }))} />
                </div>
                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Delivery Address
                  </Label>
                  <Textarea className="rounded-3xl min-h-32 bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-lg p-6" placeholder="BUILDING, STREET, CITY..." value={details.address} onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/10">
                <Label className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Payment Selection</Label>
                <RadioGroup value={details.paymentMethod} onValueChange={(val: any) => setDetails(d => ({ ...d, paymentMethod: val }))} className="grid grid-cols-1 gap-4">
                  <Label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${details.paymentMethod === 'Cash on Delivery' ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-6 w-6 text-red-600" />
                      <span className="font-black italic uppercase tracking-tighter text-xl">Cash on Delivery</span>
                    </div>
                    <RadioGroupItem value="Cash on Delivery" className="border-white/20" />
                  </Label>
                  <Label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${details.paymentMethod === 'Wish Money' ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <Wallet className="h-6 w-6 text-red-600" />
                      <span className="font-black italic uppercase tracking-tighter text-xl">Wish Money</span>
                    </div>
                    <RadioGroupItem value="Wish Money" className="border-white/20" />
                  </Label>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-10 border-t border-white/10 glass-panel space-y-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-white/40 font-black uppercase text-[10px] tracking-[0.3em]">Estimated Total</span>
              <span className="text-5xl font-black italic tracking-tighter text-white text-glow-red leading-none">${subtotal.toFixed(2)}</span>
            </div>
            
            {checkoutStep === 1 ? (
              <Button 
                onClick={() => setCheckoutStep(2)} 
                className="w-full h-20 bg-red-600 hover:bg-red-700 rounded-[2rem] text-2xl font-black italic uppercase tracking-tighter btn-glow-red transition-all"
              >
                Proceed To Order
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setCheckoutStep(1)} className="h-20 rounded-[2rem] font-black uppercase italic tracking-tighter text-lg border-white/10 hover:bg-white/5">Back</Button>
                <Button 
                  onClick={handleCheckout}
                  disabled={!details.customerName || !details.phoneNumber || !details.address}
                  className="h-20 bg-green-600 hover:bg-green-700 rounded-[2rem] font-black italic uppercase tracking-tighter text-lg gap-3 btn-glow-red"
                >
                  <Send className="h-6 w-6" /> Send To WhatsApp
                </Button>
              </div>
            )}
            <p className="text-[9px] text-center text-white/20 uppercase tracking-[0.5em] font-black">
              Eagle One Secure Delivery Protocol
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}