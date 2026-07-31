
'use client';

import { useState, useMemo } from 'react';
import { Instagram, Facebook, Twitter, Phone, MapPin, ArrowUp, UtensilsCrossed, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { StoreSettings } from '@/types/restaurant';

export function Footer() {
  const db = useFirestore();
  const { toast } = useToast();
  const [review, setReview] = useState({ name: '', comment: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stable Firestore References
  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);
  const { data: storeSettings } = useDoc<StoreSettings>(storeSettingsRef);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !review.name || !review.comment) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide your name and thoughts." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const reviewData = {
        customerName: review.name,
        comment: review.comment,
        rating: review.rating,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      setReview({ name: '', comment: '', rating: 5 });
      toast({ title: "Feedback Received", description: "Thank you for sharing your heat with us." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Submission Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const phone = storeSettings?.phone || '+961 70 105 152';
  const address = storeSettings?.address || 'Elite Kitchen, Central District';

  return (
    <footer className="bg-background border-t border-foreground/5 text-foreground pt-40 pb-20 overflow-hidden relative mesh-transition-top">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

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
              Premium Fried Chicken. Ultra-Modern Experience. Level 5 Heat.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Instagram, url: storeSettings?.instagram },
                { Icon: Facebook, url: storeSettings?.facebook },
                { Icon: Twitter, url: storeSettings?.tiktok }
              ].map((social, idx) => (
                <Link key={idx} href={social.url || '#'} className="h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center justify-center hover:bg-primary transition-all duration-500 group">
                  <social.Icon className="h-5 w-5 text-foreground/40 group-hover:text-primary-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-primary">Location</h4>
            <ul className="space-y-10 text-foreground/60">
              <li className="flex gap-5">
                <MapPin className="h-5 w-5 text-primary shrink-0" /> 
                <span className="text-[10px] uppercase tracking-[0.3em] font-black leading-loose whitespace-pre-wrap">{address}</span>
              </li>
              <li className="flex items-center gap-5">
                <Phone className="h-5 w-5 text-primary shrink-0" /> 
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">{phone}</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 bg-foreground/[0.03] p-10 rounded-[3rem] border border-foreground/5 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-8 text-primary">Your Sentiment</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div className="flex gap-4">
                <Input 
                  placeholder="FULL NAME" 
                  value={review.name}
                  onChange={e => setReview(r => ({ ...r, name: e.target.value }))}
                  className="h-14 bg-background border-foreground/10 rounded-2xl text-[10px] outline-none font-black tracking-widest text-foreground" 
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
                placeholder="WHAT'S ON YOUR MIND?" 
                value={review.comment}
                onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                className="h-24 bg-background border-foreground/10 rounded-2xl text-[10px] font-black tracking-widest pt-5 text-foreground" 
              />
              <Button disabled={isSubmitting} type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Submit Sentiment'}
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-24 border-t border-foreground/5 flex flex-col lg:flex-row items-center justify-between gap-16">
          <p className="text-[9px] text-foreground/20 font-black uppercase tracking-[0.5em]">© 2024 ANGRY CHICKZ ELITE. ALL RIGHTS RESERVED.</p>
          
          <button onClick={scrollToTop} className="h-14 w-14 rounded-full bg-foreground/5 border border-foreground/5 flex items-center justify-center hover:bg-primary transition-all duration-700 group">
            <ArrowUp className="h-5 w-5 text-foreground/20 group-hover:text-primary-foreground" />
          </button>

          <div className="flex items-center justify-center">
            <div className="glass-card px-8 py-3 rounded-full border-amber-500/10 bg-white/5 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-105 transition-all duration-700 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/10 to-primary/0 animate-shimmer" />
              <span className="text-sm font-black italic tracking-tighter uppercase whitespace-nowrap flex items-center gap-3">
                <span className="text-foreground/40 text-[10px] tracking-widest not-italic">Powered by</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                  Hassan Deeb
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
