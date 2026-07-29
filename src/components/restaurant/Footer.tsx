'use client';

import { Instagram, Facebook, Twitter, Phone, MapPin, Clock, ArrowUp, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#050607] pt-32 pb-16 overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-20 mb-32">
          <div className="space-y-10">
            <Link href="/" className="flex items-center gap-6 group">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-red-600 shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                <Image src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=200&h=200&auto=format&fit=crop" alt="Logo" fill className="object-cover" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter uppercase">
                ANGRY <span className="text-red-600">CHICKZ</span>
              </span>
            </Link>
            <p className="text-white/30 leading-relaxed font-bold text-sm uppercase tracking-wide">
              The architects of premium fast food. We don't just serve chicken; we engineer a legendary culinary heat experience.
            </p>
            <div className="flex gap-6">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-12 w-12 rounded-2xl glass-panel flex items-center justify-center hover:bg-red-600 transition-all duration-500 group">
                  <Icon className="h-6 w-6 text-white group-hover:scale-125" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-10 text-red-600">Quick Sectors</h4>
            <ul className="space-y-6 text-white/30 font-black text-xs uppercase tracking-[0.2em]">
              <li><Link href="#menu" className="hover:text-red-600 transition-colors">Burgers</Link></li>
              <li><Link href="#menu" className="hover:text-red-600 transition-colors">Crispy Tenders</Link></li>
              <li><Link href="#menu" className="hover:text-red-600 transition-colors">Executive Sides</Link></li>
              <li><Link href="#menu" className="hover:text-red-600 transition-colors">Beverages</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-10 text-red-600">Headquarters</h4>
            <ul className="space-y-8 text-white/30 font-bold">
              <li className="flex items-start gap-6">
                <MapPin className="h-6 w-6 text-red-600 shrink-0" /> 
                <span className="text-xs uppercase tracking-widest leading-loose">Heat District, Fire City, <br />Lebanon HQ</span>
              </li>
              <li className="flex items-center gap-6">
                <Phone className="h-6 w-6 text-red-600 shrink-0" /> 
                <span className="text-xs uppercase tracking-widest">+961 70 105 152</span>
              </li>
              <li className="flex items-center gap-6">
                <Clock className="h-6 w-6 text-red-600 shrink-0" /> 
                <span className="text-xs uppercase tracking-widest">Daily: 11:00 - 23:00</span>
              </li>
            </ul>
          </div>

          <div className="relative p-10 glass-panel rounded-[2rem] overflow-hidden group">
            <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-6 text-red-600 relative z-10">Elite Membership</h4>
            <p className="text-xs text-white/40 mb-8 font-bold uppercase tracking-widest relative z-10 leading-relaxed">Join the heat elite for exclusive seasonal releases.</p>
            <div className="relative z-10">
              <input type="email" placeholder="Email Address" className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 text-white text-xs outline-none focus:border-red-600/50" />
              <button className="w-full mt-4 h-14 bg-red-600 hover:bg-red-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all">Submit Entry</button>
            </div>
          </div>
        </div>

        <div className="pt-20 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">© 2024 ANGRY CHICKZ GOURMET. All Rights Reserved.</p>
            <div className="flex gap-6 text-[8px] text-white/10 font-black uppercase tracking-[0.4em]">
              <Link href="#" className="hover:text-red-600/40">Privacy Policy</Link>
              <Link href="#" className="hover:text-red-600/40">Terms of Service</Link>
            </div>
          </div>
          
          <button onClick={scrollToTop} className="h-14 w-14 glass-panel rounded-full flex items-center justify-center hover:bg-red-600/20 hover:border-red-600 transition-all group">
            <ArrowUp className="h-6 w-6 text-white/20 group-hover:text-red-600 group-hover:-translate-y-1 transition-all" />
          </button>

          <div className="flex flex-col items-center lg:items-end group scale-110 lg:scale-125">
            <div className="flex items-center gap-3 mb-2">
               <Sparkles className="h-4 w-4 text-red-600 fill-red-600 animate-pulse" />
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30 group-hover:text-red-600 transition-all">Developed By</span>
            </div>
            <div className="relative">
              <span className="text-transparent bg-clip-text bg-angry-gradient text-4xl font-black italic tracking-tighter drop-shadow-[0_10px_30px_rgba(220,38,38,0.4)] transition-all duration-700 group-hover:scale-105 block">
                Hassan Deeb - Deeb Data
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-angry-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}