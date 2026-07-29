'use client';

import { Instagram, Facebook, Twitter, Phone, MapPin, Clock, ArrowUp, UtensilsCrossed, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-foreground text-white pt-32 pb-16 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-20 mb-32">
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-2xl">
                <UtensilsCrossed className="text-white h-6 w-6" />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase italic">
                ANGRY <span className="text-primary">CHICKZ</span>
              </span>
            </div>
            <p className="text-white/40 leading-relaxed font-bold text-sm uppercase tracking-wide">
              Crafting world-class gourmet fried chicken since 2024. Quality is our obsession, heat is our soul.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary transition-all group">
                  <Icon className="h-5 w-5 text-white/50 group-hover:text-white" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-primary">Explore</h4>
            <ul className="space-y-6 text-white/40 font-black text-[11px] uppercase tracking-[0.2em]">
              <li><Link href="#menu" className="hover:text-primary transition-colors">Burgers</Link></li>
              <li><Link href="#menu" className="hover:text-primary transition-colors">Tenders</Link></li>
              <li><Link href="#menu" className="hover:text-primary transition-colors">Specials</Link></li>
              <li><Link href="#menu" className="hover:text-primary transition-colors">Sides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-primary">Locations</h4>
            <ul className="space-y-8 text-white/40">
              <li className="flex gap-4">
                <MapPin className="h-5 w-5 text-primary shrink-0" /> 
                <span className="text-[11px] uppercase tracking-widest font-bold leading-relaxed">Lebanon Head Office <br />District 1, Fire City</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-primary shrink-0" /> 
                <span className="text-[11px] uppercase tracking-widest font-bold">+961 70 105 152</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5">
            <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-6 text-primary">Join The Elite</h4>
            <p className="text-[11px] text-white/30 mb-8 font-bold uppercase tracking-widest leading-relaxed">Subscribe for exclusive seasonal drops.</p>
            <div className="space-y-4">
              <input type="email" placeholder="EMAIL ADDRESS" className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-[11px] outline-none focus:border-primary" />
              <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em]">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="pt-20 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">© 2024 ANGRY CHICKZ GOURMET. ALL RIGHTS RESERVED.</p>
          </div>
          
          <button onClick={scrollToTop} className="h-14 w-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary transition-all group">
            <ArrowUp className="h-6 w-6 text-white/20 group-hover:text-white" />
          </button>

          <div className="flex flex-col items-center lg:items-end group">
            <div className="flex items-center gap-3 mb-2">
               <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Signature Release</span>
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-white">
              Hassan Deeb - <span className="text-primary">Deeb Data</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}