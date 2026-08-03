'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, MapPin, User, Phone, Eraser, MessageCircle, ArrowRight, ArrowLeft, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';

type CheckoutStep = 'review' | 'details';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, subtotal, itemCount, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('review');
  const [details, setDetails] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    paymentMethod: 'Cash on Delivery'
  });
  const [orderInstructions, setOrderInstructions] = useState('');

  const handleNextStep = () => {
    if (cart.length > 0) setStep('details');
  };

  const handlePrevStep = () => {
    setStep('review');
  };

  const handleCheckout = () => {
    if (!details.customerName || !details.phoneNumber || !details.address || !details.paymentMethod) {
      alert("Please fill all required fields to proceed.");
      return;
    }

    const orderItems = cart.map(item => (
      `• *${item.quantity}x ${item.name}* ($${item.price.toFixed(2)} ea) - *$${(item.price * item.quantity).toFixed(2)}*\n`
    )).join('');

    const formattedMessage = 
      `🍗 *NEW ORDER: ANGRY CHICKZ* 🍗\n\n` +
      `*CUSTOMER DETAILS:*\n` +
      `👤 Name: ${details.customerName}\n` +
      `📞 Phone: ${details.phoneNumber}\n` +
      `📍 Address: ${details.address}\n` +
      `💳 Payment: ${details.paymentMethod}\n\n` +
      `*ORDER SUMMARY:*\n${orderItems}\n` +
      (orderInstructions ? `📝 *Kitchen Notes:* ${orderInstructions}\n\n` : '') +
      `💰 *Total Amount: $${subtotal.toFixed(2)}*\n\n` +
      `_Sent via Angry ChickZ Digital Menu_`;

    const whatsappNumber = '96170105152';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`, '_blank');
    
    // Reset and close
    clearCart();
    setOrderInstructions('');
    setStep('review');
    setDetails({
      customerName: '',
      phoneNumber: '',
      address: '',
      paymentMethod: 'Cash on Delivery'
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if(!open) setStep('review'); onClose(); }}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-[#FFFBEB] border-l border-amber-500/10 text-foreground z-[100]">
        <SheetHeader className="p-6 border-b border-amber-500/5 bg-white/40 backdrop-blur-md shrink-0">
          <SheetTitle className="flex items-center justify-between text-2xl font-black uppercase italic tracking-tighter">
            <div className="flex items-center gap-2">
              {step === 'details' && (
                <button onClick={handlePrevStep} className="mr-2 hover:text-primary transition-colors">
                  <ArrowLeft className="h-6 w-6" />
                </button>
              )}
              {step === 'review' ? 'Your Basket' : 'Checkout Details'}
            </div>
            <span className="text-[10px] font-black bg-primary text-white px-4 py-1.5 rounded-full shadow-lg">
              {itemCount} ITEMS
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8 pb-32">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
                <ShoppingBag className="h-24 w-24 mb-6 stroke-1" />
                <p className="text-xl font-black uppercase italic">Basket Empty</p>
                <p className="text-xs mt-2 font-bold uppercase tracking-widest">Add some heat to start</p>
              </div>
            ) : step === 'review' ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Review Items</h3>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2">
                    <Eraser className="h-3 w-3" /> Clear All
                  </Button>
                </div>
                
                {cart.map(item => (
                  <div key={item.id} className="space-y-4 pb-8 border-b border-amber-500/5">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden glass-card shadow-lg flex-shrink-0">
                        <Image src={item.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={item.name} fill className="object-cover" />
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

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Order Instructions (Optional)</Label>
                  <Textarea 
                    placeholder="Any specific requests for the kitchen?" 
                    value={orderInstructions}
                    onChange={(e) => setOrderInstructions(e.target.value)}
                    className="bg-white border-amber-500/10 rounded-2xl min-h-[100px] text-xs font-bold focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Customer Information</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                      <User className="h-3 w-3" /> Full Name *
                    </Label>
                    <Input 
                      className="rounded-2xl h-14 bg-white border-amber-500/10 font-bold focus:ring-primary" 
                      placeholder="Your Name" 
                      value={details.customerName} 
                      onChange={e => setDetails(d => ({ ...d, customerName: e.target.value }))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Phone Number *
                    </Label>
                    <Input 
                      className="rounded-2xl h-14 bg-white border-amber-500/10 font-bold focus:ring-primary" 
                      placeholder="WhatsApp Number" 
                      value={details.phoneNumber} 
                      onChange={e => setDetails(d => ({ ...d, phoneNumber: e.target.value }))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Delivery Address *
                    </Label>
                    <Textarea 
                      className="rounded-2xl min-h-[100px] bg-white border-amber-500/10 font-bold focus:ring-primary" 
                      placeholder="Street, Building, Floor, Apartment..." 
                      value={details.address} 
                      onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Payment Method</h3>
                  <RadioGroup 
                    value={details.paymentMethod} 
                    onValueChange={(val) => setDetails(prev => ({ ...prev, paymentMethod: val }))}
                    className="grid grid-cols-1 gap-3"
                  >
                    <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${details.paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5' : 'border-amber-500/5 bg-white'}`} onClick={() => setDetails(prev => ({ ...prev, paymentMethod: 'Cash on Delivery' }))}>
                      <div className="flex items-center gap-3">
                        <Banknote className={`h-5 w-5 ${details.paymentMethod === 'Cash on Delivery' ? 'text-primary' : 'text-foreground/40'}`} />
                        <span className="font-bold text-sm">Cash on Delivery</span>
                      </div>
                      <RadioGroupItem value="Cash on Delivery" id="cash" className="sr-only" />
                      {details.paymentMethod === 'Cash on Delivery' && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    
                    <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${details.paymentMethod === 'Card / Online' ? 'border-primary bg-primary/5' : 'border-amber-500/5 bg-white'}`} onClick={() => setDetails(prev => ({ ...prev, paymentMethod: 'Card / Online' }))}>
                      <div className="flex items-center gap-3">
                        <CreditCard className={`h-5 w-5 ${details.paymentMethod === 'Card / Online' ? 'text-primary' : 'text-foreground/40'}`} />
                        <span className="font-bold text-sm">Card / Online</span>
                      </div>
                      <RadioGroupItem value="Card / Online" id="card" className="sr-only" />
                      {details.paymentMethod === 'Card / Online' && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-amber-500/10 bg-white/80 backdrop-blur-xl space-y-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] sticky bottom-0 z-50 shrink-0">
            <div className="flex justify-between items-center px-2">
              <span className="text-foreground/40 font-black text-[10px] uppercase tracking-[0.2em]">Total Bill</span>
              <span className="text-3xl font-black italic tracking-tighter text-primary">${subtotal.toFixed(2)}</span>
            </div>
            
            {step === 'review' ? (
              <Button 
                onClick={handleNextStep}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-black uppercase italic shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                Continue to Details <ArrowRight className="h-6 w-6" />
              </Button>
            ) : (
              <Button 
                onClick={handleCheckout}
                disabled={!details.customerName || !details.phoneNumber || !details.address}
                className="w-full h-16 bg-green-600 hover:bg-green-700 disabled:bg-zinc-300 rounded-2xl text-lg font-black uppercase italic shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <MessageCircle className="h-6 w-6" /> Send via WhatsApp
              </Button>
            )}
            
            <p className="text-[9px] text-center text-foreground/20 uppercase tracking-[0.3em] font-black">
              {step === 'review' ? 'Step 1 of 2 • Review Order' : 'Step 2 of 2 • Delivery Details'}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
