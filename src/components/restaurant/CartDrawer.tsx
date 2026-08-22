'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, MapPin, User, Phone, Eraser, MessageCircle, ArrowRight, ArrowLeft, X, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Image from 'next/image';
import { useFirestore, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { StoreSettings } from '@/types/restaurant';

type CheckoutStep = 'review' | 'details';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, itemCount, clearCart, formatPrice } = useCart();
  const db = useFirestore();

  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);
  const { data: storeSettings } = useDoc<StoreSettings>(storeSettingsRef);

  const [step, setStep] = useState<CheckoutStep>('review');
  const [isLocating, setIsLocating] = useState(false);
  const [details, setDetails] = useState({
    customerName: '',
    phoneNumber: '',
    address: ''
  });
  const [orderInstructions, setOrderInstructions] = useState('');

  const handleNextStep = () => {
    if (cart.length > 0) setStep('details');
  };

  const handlePrevStep = () => {
    setStep('review');
  };

  const handleCheckout = async () => {
    if (!details.customerName || !details.phoneNumber || !details.address) {
      alert("Please fill in your name, phone, and address to complete the order.");
      return;
    }

    setIsLocating(true);

    // Attempt to get GPS Location for delivery
    let gpsLink = '';
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, 
            timeout: 8000 
          });
        });
        gpsLink = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
      } catch (e) {
        console.warn("Geolocation failed or was denied:", e);
      }
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      customerName: details.customerName,
      phoneNumber: details.phoneNumber,
      address: details.address,
      items: cart,
      totalAmount: totalAmount,
      status: 'pending',
      createdAt: serverTimestamp(),
      notes: orderInstructions,
      gpsLocation: gpsLink || undefined
    };

    try {
      if (db) {
        await addDoc(collection(db, 'orders'), orderData);
      }
    } catch (e) {
      console.error("Error saving order to Firestore:", e);
    }

    const orderItems = cart.map(item => (
      `• *${item.quantity}x ${item.name}* - *${formatPrice(item.price * item.quantity, item.currency)}*\n`
    )).join('');

    // Building the WhatsApp message with clear Total and GPS Link
    const formattedMessage = 
      `🍗 *NEW ORDER: ANGRY CHICKZ* 🍗\n\n` +
      `👤 *الاسم:* ${details.customerName}\n` +
      `📞 *رقم الهاتف:* ${details.phoneNumber}\n` +
      `📍 *العنوان:* ${details.address}\n` +
      (gpsLink ? `📍 *رابط الموقع المباشر (GPS):* ${gpsLink}\n` : '') +
      `💰 *المجموع النهائي للفاتورة:* *${formatPrice(totalAmount, cart[0]?.currency)}*\n\n` +
      `*تفاصيل الطلب:*\n${orderItems}\n` +
      (orderInstructions ? `📝 *ملاحظات:* ${orderInstructions}\n\n` : '') +
      `🚀 شكراً لطلبكم من Angry ChickZ!`;

    const rawNumber = (storeSettings?.whatsappNumber || '96170105152').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(formattedMessage)}`;
    
    setIsLocating(false);
    window.location.href = whatsappUrl;
    
    clearCart();
    setOrderInstructions('');
    setStep('review');
    setDetails({ customerName: '', phoneNumber: '', address: '' });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if(!open) setStep('review'); onClose(); }}>
      <SheetContent className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-amber-500/10 text-foreground z-[10000] flex flex-col h-[100dvh] overflow-hidden p-0 outline-none">
        
        <SheetHeader className="flex-none p-4 border-b border-amber-500/5 bg-background shrink-0 z-10">
          <SheetTitle className="flex items-center justify-between text-xl font-black uppercase italic tracking-tighter">
            <div className="flex items-center gap-2">
              {step === 'details' ? (
                <button onClick={handlePrevStep} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                  <ArrowLeft className="h-5 w-5 text-primary" />
                </button>
              ) : (
                <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                  <X className="h-5 w-5 text-primary" />
                </button>
              )}
              {step === 'review' ? 'سلة الطلبات' : 'تفاصيل التوصيل'}
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black bg-primary text-white px-3 py-1 rounded-full shadow-md">
                 {itemCount} أصناف
               </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-background">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ShoppingBag className="h-16 w-16 mb-4 stroke-1 text-primary" />
              <p className="text-lg font-black uppercase italic">السلة فارغة</p>
              <Button onClick={onClose} variant="outline" className="mt-4 rounded-xl border-primary/40 text-primary font-black uppercase italic text-xs">
                العودة للقائمة
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {step === 'review' ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">مراجعة الأصناف</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-500/5 gap-1.5">
                        <ArrowLeft className="h-3 w-3" /> متابعة التسوق
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearCart} className="h-7 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-1.5">
                        <Eraser className="h-3 w-3" /> مسح الكل
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-3 pb-3 border-b border-amber-500/5">
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                          <Image src={item.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-grow py-0.5">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="font-black text-sm text-foreground italic tracking-tighter uppercase line-clamp-1">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-foreground/20 hover:text-primary transition-colors p-1">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-foreground/5 border border-amber-500/10 rounded-lg p-0.5">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-primary transition-colors"><Minus className="h-2.5 w-2.5" /></button>
                              <span className="w-6 text-center font-black text-[10px]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-primary transition-colors"><Plus className="h-2.5 w-2.5" /></button>
                            </div>
                            <span className="font-black text-sm italic tracking-tighter text-primary">{formatPrice(item.price * item.quantity, item.currency)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mb-1.5 block">
                      ملاحظات إضافية (اختياري)
                    </Label>
                    <Textarea 
                      placeholder="أي تعليمات خاصة للمطبخ؟" 
                      value={orderInstructions}
                      onChange={(e) => setOrderInstructions(e.target.value)}
                      className="bg-foreground/[0.03] border-amber-500/10 rounded-xl min-h-[80px] text-xs font-bold"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                        <User className="h-3 w-3" /> الاسم الكامل *
                      </Label>
                      <Input 
                        className="rounded-xl h-12 bg-foreground/[0.03] border-amber-500/10 font-bold text-xs" 
                        placeholder="أدخل اسمك" 
                        value={details.customerName} 
                        onChange={e => setDetails(d => ({ ...d, customerName: e.target.value }))} 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> رقم الهاتف (واتساب) *
                      </Label>
                      <Input 
                        className="rounded-xl h-12 bg-foreground/[0.03] border-amber-500/10 font-bold text-xs" 
                        placeholder="رقم هاتفك للتواصل" 
                        value={details.phoneNumber} 
                        onChange={e => setDetails(d => ({ ...d, phoneNumber: e.target.value }))} 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> عنوان التوصيل بالتفصيل *
                      </Label>
                      <Textarea 
                        className="rounded-xl bg-foreground/[0.03] border-amber-500/10 font-bold text-xs min-h-[100px]" 
                        placeholder="المنطقة، الشارع، البناية، الطابق..." 
                        value={details.address} 
                        onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="flex-none border-t p-4 bg-background shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
            {step === 'review' ? (
              <Button 
                onClick={handleNextStep}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-black uppercase italic shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                المتابعة للعنوان <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                onClick={handleCheckout}
                disabled={isLocating}
                className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-xl text-base font-black uppercase italic shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {isLocating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> جاري تحديد موقعك...
                  </span>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" /> إرسال الطلب عبر الواتساب
                  </>
                )}
              </Button>
            )}
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}