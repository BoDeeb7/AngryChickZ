'use client';

import { useState, useMemo } from 'react';
import { Instagram, Facebook, Phone, MapPin, ArrowUp, UtensilsCrossed, Star, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { StoreSettings } from '@/types/restaurant';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
  </svg>
);

export function Footer() {
  const db = useFirestore();
  const { toast } = useToast();
  const [review, setReview] = useState({ name: '', comment: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);
  const { data: storeSettings } = useDoc<StoreSettings>(storeSettingsRef);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !review.name || !review.comment || isSubmitting) return;
    
    setIsSubmitting(true);
    const reviewData = {
      customerName: review.name.trim(),
      comment: review.comment.trim(),
      rating: review.rating,
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, 'reviews'), reviewData)
      .finally(() => {
        setIsSubmitting(false);
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'reviews',
          operation: 'create',
          requestResourceData: reviewData
        }));
      });

    setReview({ name: '', comment: '', rating: 5 });
    toast({ title: "Sent!", description: "Thanks for your feedback." });
  };

  return (
    <footer className="bg-background border-t border-foreground/5 text-foreground pt-40 pb-20 overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-20 mb-40">
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2.5 rounded-2xl shadow-xl">
                <UtensilsCrossed className="text-primary-foreground h-6 w-6" />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase italic">
                ANGRY <span className="text-primary">CHICKZ</span>
              </span>
            </div>
            <p className="text-foreground/40 leading-relaxed font-bold text-[10px] uppercase tracking-[0.2em]">
              Premium Fried Chicken. Ultra-Modern Experience.
            </p>
            <div className="flex gap-4">
              {storeSettings?.instagram && (
                <Link href={storeSettings.instagram} target="_blank" className="h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center justify-center hover:bg-primary transition-all duration-500 group">
                  <Instagram className="h-5 w-5 text-foreground/40 group-hover:text-primary-foreground" />
                </Link>
              )}
              {storeSettings?.facebook && (
                <Link href={storeSettings.facebook} target="_blank" className="h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center justify-center hover:bg-primary transition-all duration-500 group">
                  <Facebook className="h-5 w-5 text-foreground/40 group-hover:text-primary-foreground" />
                </Link>
              )}
              {storeSettings?.tiktok && (
                <Link href={storeSettings.tiktok} target="_blank" className="h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center justify-center hover:bg-primary transition-all duration-500 group">
                  <TikTokIcon className="h-5 w-5 text-foreground/40 group-hover:text-primary-foreground" />
                </Link>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-primary">Contact Us</h4>
            <ul className="space-y-8 text-foreground/60">
              <li className="flex gap-5">
                <MapPin className="h-5 w-5 text-primary shrink-0" /> 
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Our Location</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black leading-relaxed">{storeSettings?.address || 'City Center, Lebanon'}</span>
                </div>
              </li>
              <li className="flex items-center gap-5">
                <Phone className="h-5 w-5 text-primary shrink-0" /> 
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Support Line</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">{storeSettings?.phone || 'Contact Support'}</span>
                </div>
              </li>
              <li className="flex items-center gap-5">
                <MessageCircle className="h-5 w-5 text-green-500 shrink-0" /> 
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Direct WhatsApp</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-green-500">{storeSettings?.whatsappNumber || 'Live Order'}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 bg-foreground/[0.03] p-10 rounded-[3rem] border border-foreground/5 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-8 text-primary">Your Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div className="flex gap-4">
                <Input 
                  placeholder="FULL NAME" 
                  value={review.name}
                  onChange={e => setReview(r => ({ ...r, name: e.target.value }))}
                  className="h-14 bg-background border-foreground/10 rounded-2xl text-[10px] font-black tracking-widest text-foreground" 
                />
                <div className="flex items-center gap-2 bg-background px-4 rounded-2xl border border-foreground/10">
                  {[1,2,3,4,5].map(i => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 cursor-pointer transition-colors ${i <= review.rating ? 'fill-secondary text-secondary' : 'text-foreground/10 hover:text-foreground/40'}`} 
                      onClick={() => setReview(r => ({ ...r, rating: i }))}
                    />
                  ))}
                </div>
              </div>
              <Textarea 
                placeholder="MESSAGE" 
                value={review.comment}
                onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                className="h-24 bg-background border-foreground/10 rounded-2xl text-[10px] font-black tracking-widest pt-5 text-foreground" 
              />
              <Button disabled={isSubmitting} type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-24 border-t border-foreground/5 flex flex-col lg:flex-row items-center justify-between gap-16">
          <p className="text-[9px] text-foreground/20 font-black uppercase tracking-[0.5em]">© 2024 ANGRY CHICKZ. ALL RIGHTS RESERVED.</p>
          
          <button onClick={scrollToTop} className="h-14 w-14 rounded-full bg-foreground/5 border border-foreground/5 flex items-center justify-center hover:bg-primary transition-all duration-700 group">
            <ArrowUp className="h-5 w-5 text-foreground/20 group-hover:text-primary-foreground" />
          </button>

          <div className="flex items-center justify-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
               Powered by <span className="text-amber-500 italic">Hassan Deeb</span>
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
