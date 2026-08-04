'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, MapPin, User, Phone, Eraser, MessageCircle, ArrowRight, ArrowLeft, DollarSign, Landmark } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Image from 'next/image';

type CheckoutStep = 'review' | 'details';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, subtotal, itemCount, clearCart, currency, formatPrice, exchangeRate } = useCart();
  const [step, setStep] = useState<CheckoutStep>('review');
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

  const handleCheckout = () => {
    if (!details.customerName || !details.phoneNumber || !details.address) {
      alert("يرجى ملء الاسم، الرقم، والعنوان لإتمام الطلب");
      return;
    }

    const orderItems = cart.map(item => (
      `• *${item.quantity}x ${item.name}* - *${formatPrice(item.price * item.quantity)}*\n`
    )).join('');

    const totalInLBP = (subtotal * exchangeRate).toLocaleString();

    const formattedMessage = 
      `🍗 *طلب جديد: ANGRY CHICKZ* 🍗\n\n` +
      `👤 الاسم: ${details.customerName}\n` +
      `📞 الرقم: ${details.phoneNumber}\n` +
      `📍 العنوان: ${details.address}\n\n` +
      `*تفاصيل الطلب:*\n${orderItems}\n` +
      (orderInstructions ? `📝 *ملاحظات:* ${orderInstructions}\n\n` : '') +
      `💰 *المجموع الإجمالي: ${formatPrice(subtotal)}*\n` +
      (currency === 'USD' ? `💵 المجموع بالليرة: ${totalInLBP} ل.ل.` : `💵 المجموع بالدولار: $${subtotal.toFixed(2)}`) +
      ` \n(سعر الصرف المعتمد: ${exchangeRate.toLocaleString()} ل.ل.)`;

    const whatsappNumber = '96170105152';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`, '_blank');
    
    clearCart();
    setOrderInstructions('');
    setStep('review');
    setDetails({ customerName: '', phoneNumber: '', address: '' });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if(!open) setStep('review'); onClose(); }}>
      <SheetContent className="w-full sm:max-w-md p-0 bg-[#FFFBEB] border-l border-amber-500/10 text-foreground z-[100] flex flex-col h-full overflow-hidden">
        {/* Header: ثابت في القمة */}
        <SheetHeader className="p-4 border-b border-amber-500/5 bg-white/40 backdrop-blur-md shrink-0">
          <SheetTitle className="flex items-center justify-between text-xl font-black uppercase italic tracking-tighter">
            <div className="flex items-center gap-2">
              {step === 'details' && (
                <button onClick={handlePrevStep} className="mr-1 hover:text-primary transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              {step === 'review' ? 'سلة المشتريات' : 'تفاصيل التوصيل'}
            </div>
            <span className="text-[9px] font-black bg-primary text-white px-3 py-1 rounded-full shadow-md">
              {itemCount} أصناف
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Body: منطقة التمرير الوسطى */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-amber-200">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 opacity-20">
              <ShoppingBag className="h-16 w-16 mb-4 stroke-1" />
              <p className="text-lg font-black uppercase italic">السلة فارغة</p>
            </div>
          ) : step === 'review' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">مراجعة الأصناف</h3>
                <Button variant="ghost" size="sm" onClick={clearCart} className="h-7 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-1.5">
                  <Eraser className="h-3 w-3" /> مسح الكل
                </Button>
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
                        <button onClick={() => removeFromCart(item.id)} className="text-foreground/10 hover:text-primary transition-colors p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white border border-amber-500/10 rounded-lg p-0.5">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-primary transition-colors"><Minus className="h-2.5 w-2.5" /></button>
                          <span className="w-6 text-center font-black text-[10px]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-primary transition-colors"><Plus className="h-2.5 w-2.5" /></button>
                        </div>
                        <span className="font-black text-sm italic tracking-tighter text-primary">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mb-1.5 block">
                  ملاحظات إضافية (اختياري)
                </Label>
                <Textarea 
                  placeholder="أي تعليمات خاصة للمطبخ؟" 
                  value={orderInstructions}
                  onChange={(e) => setOrderInstructions(e.target.value)}
                  className="bg-white border-amber-500/10 rounded-xl min-h-[60px] text-xs font-bold"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="h-2.5 w-2.5" /> الاسم الكامل *
                  </Label>
                  <Input 
                    className="rounded-xl h-11 bg-white border-amber-500/10 font-bold text-sm" 
                    placeholder="أدخل اسمك" 
                    value={details.customerName} 
                    onChange={e => setDetails(d => ({ ...d, customerName: e.target.value }))} 
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="h-2.5 w-2.5" /> رقم الهاتف *
                  </Label>
                  <Input 
                    className="rounded-xl h-11 bg-white border-amber-500/10 font-bold text-sm" 
                    placeholder="رقم الواتساب" 
                    value={details.phoneNumber} 
                    onChange={e => setDetails(d => ({ ...d, phoneNumber: e.target.value }))} 
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="h-2.5 w-2.5" /> عنوان التوصيل *
                  </Label>
                  <Input 
                    className="rounded-xl h-11 bg-white border-amber-500/10 font-bold text-sm" 
                    placeholder="الشارع، البناية، الطابق..." 
                    value={details.address} 
                    onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} 
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer: المجموع وزر الواتساب مثبتان بالأسفل تماماً */}
        {cart.length > 0 && (
          <footer className="p-4 border-t border-amber-500/10 bg-white/80 backdrop-blur-xl shrink-0 sticky bottom-0 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-foreground/40 font-black text-[9px] uppercase tracking-[0.2em]">المجموع الإجمالي</span>
              <span className="text-xl font-black italic tracking-tighter text-primary">{formatPrice(subtotal)}</span>
            </div>
            
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
                className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-xl text-base font-black uppercase italic shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="h-5 w-5" /> اطلب عبر واتساب
              </Button>
            )}
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}
