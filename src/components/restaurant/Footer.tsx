'use client';

import { useState } from 'react';
import { Instagram, Facebook, Twitter, Phone, MapPin, ArrowUp, UtensilsCrossed, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function Footer() {
  const db = useFirestore();
  const { toast } = useToast();
  const [review, setReview] = useState({ name: '', comment: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !review.name || !review.comment) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        customerName: review.name,
        comment: review.comment,
        rating: review.rating,
        createdAt: serverTimestamp()
      });
      setReview({ name: '', comment: '', rating: 5 });
      toast({ title: "Sentiment Logged", description: "Thank you for your feedback." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not submit review." });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Gourmet fried chicken obsession. Established 2024. Level 5 heat.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center justify-center hover:bg-primary transition-all duration-500 group">
                  <Icon className="h-5 w-5 text-foreground/40 group-hover:text-primary-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-primary">Contact Us</h4>
            <ul className="space-y-10 text-foreground/60">
              <li className="flex gap-5">
                <MapPin className="h-5 w-5 text-primary shrink-0" /> 
                <span className="text-[10px] uppercase tracking-[0.3em] font-black leading-loose">Elite Kitchen <br />Central District</span>
              </li>
              <li className="flex items-center gap-5">
                <Phone className="h-5 w-5 text-primary shrink-0" /> 
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">+961 70 105 152</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 bg-foreground/[0.03] p-10 rounded-[3rem] border border-foreground/5 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-8 text-primary">Customer Sentiment</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div className="flex gap-4">
                <Input 
                  placeholder="NAME" 
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
                placeholder="YOUR THOUGHTS..." 
                value={review.comment}
                onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                className="h-24 bg-background border-foreground/10 rounded-2xl text-[10px] font-black tracking-widest pt-5 text-foreground" 
              />
              <Button disabled={isSubmitting} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
                {isSubmitting ? 'Logging...' : 'Submit Review'}
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-24 border-t border-foreground/5 flex flex-col lg:flex-row items-center justify-between gap-16">
          <p className="text-[9px] text-foreground/20 font-black uppercase tracking-[0.5em]">© 2024 ANGRY CHICKZ ELITE. ALL RIGHTS RESERVED.</p>
          
          <button onClick={scrollToTop} className="h-14 w-14 rounded-full bg-foreground/5 border border-foreground/5 flex items-center justify-center hover:bg-primary transition-all duration-700 group">
            <ArrowUp className="h-5 w-5 text-foreground/20 group-hover:text-primary-foreground" />
          </button>

          <div className="flex flex-col items-center lg:items-end group">
            <div className="flex items-center gap-3 mb-4 opacity-40">
               <Sparkles className="h-3 w-3 text-secondary animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground">Elite Signature Release</span>
            </div>
            <div className="glass-card px-8 py-4 rounded-[2rem] border-foreground/5 bg-foreground/[0.02] shadow-[0_0_40px_rgba(225,29,72,0.15)] group-hover:scale-105 transition-transform duration-700">
              <span className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                Powered by Hassan Deeb
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
