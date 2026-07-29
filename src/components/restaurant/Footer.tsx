'use client';

import { Instagram, Facebook, Twitter, Phone, MapPin, ArrowUp, UtensilsCrossed, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-foreground text-white pt-40 pb-20 overflow-hidden relative mesh-transition-top">
      {/* Background glow for footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-24 mb-40">
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl shadow-xl">
                <UtensilsCrossed className="text-white h-7 w-7" />
              </div>
              <span className="text-4xl font-black tracking-tighter uppercase italic">
                ANGRY <span className="text-primary">CHICKZ</span>
              </span>
            </div>
            <p className="text-white/30 leading-relaxed font-bold text-[12px] uppercase tracking-[0.2em]">
              Crafting world-class gourmet fried chicken. Quality is our obsession, heat is our soul. Established in 2024.
            </p>
            <div className="flex gap-5">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary transition-all duration-500 group shadow-lg">
                  <Icon className="h-6 w-6 text-white/30 group-hover:text-white" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[12px] font-black uppercase tracking-[0.5em] mb-12 text-primary">Sectors</h4>
            <ul className="space-y-8 text-white/30 font-black text-[11px] uppercase tracking-[0.3em]">
              <li><Link href="#menu" className="hover:text-primary transition-colors">Burgers</Link></li>
              <li><Link href="#menu" className="hover:text-primary transition-colors">Tenders</Link></li>
              <li><Link href="#menu" className="hover:text-primary transition-colors">Specials</Link></li>
              <li><Link href="#menu" className="hover:text-primary transition-colors">Sides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-black uppercase tracking-[0.5em] mb-12 text-primary">Location</h4>
            <ul className="space-y-10 text-white/30">
              <li className="flex gap-5">
                <MapPin className="h-6 w-6 text-primary shrink-0" /> 
                <span className="text-[11px] uppercase tracking-[0.3em] font-black leading-loose">Elite Kitchen <br />Central District</span>
              </li>
              <li className="flex items-center gap-5">
                <Phone className="h-6 w-6 text-primary shrink-0" /> 
                <span className="text-[11px] uppercase tracking-[0.3em] font-black">+961 70 105 152</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/[0.03] p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
            <h4 className="text-[12px] font-black uppercase tracking-[0.5em] mb-8 text-primary">VIP Access</h4>
            <p className="text-[11px] text-white/20 mb-10 font-black uppercase tracking-[0.3em] leading-loose">Join the elite inner circle for limited drops.</p>
            <div className="space-y-5">
              <input type="email" placeholder="VIP EMAIL" className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-8 text-white text-[11px] outline-none focus:border-primary transition-colors font-black tracking-widest" />
              <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl">Initialize</Button>
            </div>
          </div>
        </div>

        <div className="pt-24 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-16">
          <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.5em]">© 2024 ANGRY CHICKZ ELITE. ALL RIGHTS RESERVED.</p>
          
          <button onClick={scrollToTop} className="h-16 w-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary transition-all duration-700 group shadow-2xl">
            <ArrowUp className="h-7 w-7 text-white/10 group-hover:text-white" />
          </button>

          <div className="flex flex-col items-center lg:items-end group scale-110">
            <div className="flex items-center gap-4 mb-4 opacity-40">
               <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Elite Signature Release</span>
            </div>
            <div className="glass-card px-10 py-5 rounded-[2.5rem] border-white/5 bg-white/[0.02] shadow-[0_0_40px_rgba(225,29,72,0.15)] group-hover:scale-105 transition-transform duration-700">
              <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                Powered by <span className="text-gradient-crimson">Hassan Deeb</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}