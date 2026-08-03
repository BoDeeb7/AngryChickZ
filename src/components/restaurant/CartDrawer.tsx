'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, MapPin, User, Phone, Eraser, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Image from 'next/image';

type CheckoutStep = 'review' | 'details';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, subtotal, itemCount, clearCart } = useCart();
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
      `• *${item.quantity}x ${item.name}* - *$${(item.price * item.quantity).toFixed(2)}*\n`
    )).join('');

    const formattedMessage = 
      `🍗 *طلب جديد: ANGRY CHICKZ* 🍗\n\n` +
      `👤 الاسم: ${details.customerName}\n` +
      `📞 الرقم: ${details.phoneNumber}\n` +
      `📍 العنوان: ${details.address}\n\n` +
      `*تفاصيل الطلب:*\n${orderItems}\n` +
      (orderInstructions ? `📝 *ملاحظات:* ${orderInstructions}\n\n` : '') +
      `💰 *المجموع الإجمالي: $${subtotal.toFixed(2)}*`;

    const whatsappNumber = '96170105152';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`, '_blank');
    
    // إعادة تعيين السلة بعد الإرسال
    clearCart();
    setOrderInstructions('');
    setStep('review');
    setDetails({ customerName: '', phoneNumber: '', address: '' });
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
              {step === 'review' ? 'سلة المشتريات' : 'تفاصيل التوصيل'}
            </div>
            <span className="text-[10px] font-black bg-primary text-white px-4 py-1.5 rounded-full shadow-lg">
              {itemCount} أصناف
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-8">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
                <ShoppingBag className="h-24 w-24 mb-6 stroke-1" />
                <p className="text-xl font-black uppercase italic">السلة فارغة</p>
              </div>
            ) : step === 'review' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40">مراجعة الأصناف</h3>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2">
                    <Eraser className="h-3 w-3" /> مسح الكل
                  </Button>
                </div>
                
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-amber-500/5">
                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                      <Image src={item.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow py-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-lg text-foreground italic tracking-tighter uppercase">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-foreground/10 hover:text-primary transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
                ))}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                      <User className="h-3 w-3" /> الاسم الكامل *
                    </Label>
                    <Input 
                      className="rounded-2xl h-14 bg-white border-amber-500/10 font-bold" 
                      placeholder="أدخل اسمك" 
                      value={details.customerName} 
                      onChange={e => setDetails(d => ({ ...d, customerName: e.target.value }))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="h-3 w-3" /> رقم الهاتف *
                    </Label>
                    <Input 
                      className="rounded-2xl h-14 bg-white border-amber-500/10 font-bold" 
                      placeholder="رقم الواتساب" 
                      value={details.phoneNumber} 
                      onChange={e => setDetails(d => ({ ...d, phoneNumber: e.target.value }))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> عنوان التوصيل *
                    </Label>
                    <Textarea 
                      className="rounded-2xl min-h-[100px] bg-white border-amber-500/10 font-bold" 
                      placeholder="الشارع، البناية، الطابق..." 
                      value={details.address} 
                      onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                      ملاحظات إضافية
                    </Label>
                    <Textarea 
                      placeholder="أي تعليمات خاصة للمطبخ؟" 
                      value={orderInstructions}
                      onChange={(e) => setOrderInstructions(e.target.value)}
                      className="bg-white border-amber-500/10 rounded-2xl min-h-[80px] text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-amber-500/10 bg-white/80 backdrop-blur-xl space-y-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] shrink-0">
            <div className="flex justify-between items-center px-2">
              <span className="text-foreground/40 font-black text-[10px] uppercase tracking-[0.2em]">المجموع</span>
              <span className="text-3xl font-black italic tracking-tighter text-primary">${subtotal.toFixed(2)}</span>
            </div>
            
            {step === 'review' ? (
              <Button 
                onClick={handleNextStep}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-black uppercase italic shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                المتابعة للعنوان <ArrowRight className="h-6 w-6" />
              </Button>
            ) : (
              <Button 
                onClick={handleCheckout}
                className="w-full h-16 bg-green-600 hover:bg-green-700 rounded-2xl text-lg font-black uppercase italic shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <MessageCircle className="h-6 w-6" /> اطلب عبر واتساب
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
