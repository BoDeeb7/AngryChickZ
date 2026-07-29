
'use client';

import { Flame, Instagram, Facebook, Twitter, Phone, MapPin, Clock, ArrowUpCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0F0F12] pt-40 pb-20 overflow-hidden border-t border-white/5">
      <div className="ambient-orb w-[500px] h-[500px] bg-red-600/10 bottom-0 left-[-250px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-24 mb-40">
          <div className="space-y-12 lg:col-span-1">
            <Link href="/" className="flex items-center gap-6 group">
              <div className="relative h-20 w-20 overflow-hidden rounded-[1.5rem] border-2 border-red-600 shadow-2xl group-hover:rotate-6 transition-transform">
                <Image src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=200&h=200&auto=format&fit=crop" alt="Logo" fill className="object-cover" />
              </div>
              <span className="text-4xl font-black italic tracking-tighter text-white">
                ANGRY <span className="text-red-600">CHICKZ</span>
              </span>
            </Link>
            <p className="text-white/40 leading-relaxed font-medium text-lg">
              We define the standard of high-heat gourmet dining. Precision frying, secret spice chemistry, and absolute flavor dominance.
            </p>
            <div className="flex gap-5">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-16 w-16 rounded-[1.5rem] glass-panel flex items-center justify-center hover:bg-red-600 transition-all duration-500 group">
                  <Icon className="h-7 w-7 text-white group-hover:scale-125 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black italic uppercase tracking-[0.5em] mb-12 text-red-600">Strategic Sectors</h4>
            <ul className="space-y-6 text-white/40 font-black uppercase italic tracking-tighter text-xl">
              <li><Link href="#menu" className="hover:text-white hover:pl-2 transition-all duration-300">Burgers & Buns</Link></li>
              <li><Link href="#menu" className="hover:text-white hover:pl-2 transition-all duration-300">Crispy Buckets</Link></li>
              <li><Link href="#menu" className="hover:text-white hover:pl-2 transition-all duration-300">Liquid Gold</Link></li>
              <li><Link href="#menu" className="hover:text-white hover:pl-2 transition-all duration-300">Dark Reserves</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black italic uppercase tracking-[0.5em] mb-12 text-red-600">Operations</h4>
            <ul className="space-y-8 text-white/40 font-medium text-lg">
              <li className="flex items-start gap-5">
                <MapPin className="h-7 w-7 text-red-600 shrink-0" /> 
                <span className="font-black uppercase italic tracking-tighter">Sector 7, Heat District, Fire City</span>
              </li>
              <li className="flex items-center gap-5">
                <Phone className="h-7 w-7 text-red-600 shrink-0" /> 
                <span className="font-black uppercase italic tracking-tighter">+961 70 105 152</span>
              </li>
              <li className="flex items-center gap-5">
                <Clock className="h-7 w-7 text-red-600 shrink-0" /> 
                <span className="font-black uppercase italic tracking-tighter">Daily: 11:00 - 23:00</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black italic uppercase tracking-[0.5em] mb-12 text-red-600">VIP Intelligence</h4>
            <p className="text-base text-white/40 mb-8 font-medium">Access classified menu updates and priority intel.</p>
            <div className="relative">
              <input type="email" placeholder="SECURE EMAIL ADDRESS" className="w-full h-20 glass-panel rounded-[2rem] px-8 text-white uppercase font-black italic tracking-tighter placeholder:text-white/20 outline-none focus:ring-2 focus:ring-red-600" />
              <button className="absolute right-3 top-3 bottom-3 bg-red-600 hover:bg-red-700 px-8 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-xl">Secure</button>
            </div>
          </div>
        </div>

        <div className="pt-20 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex flex-col items-center lg:items-start gap-2">
             <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.8em]">© ANGRY CHICKZ GLOBAL. ALL RIGHTS RESERVED.</p>
             <p className="text-[10px] text-red-600/40 font-black uppercase tracking-[0.5em]">Operations Secure • SSL Encrypted</p>
          </div>
          
          <button onClick={scrollToTop} className="flex flex-col items-center gap-3 group">
            <ArrowUpCircle className="h-12 w-12 text-white/10 group-hover:text-red-600 group-hover:-translate-y-2 transition-all duration-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/10">Extraction</span>
          </button>

          <div className="flex flex-col items-center lg:items-end group cursor-default">
            <div className="flex items-center gap-3 mb-4">
               <Zap className="h-4 w-4 text-red-600 fill-red-600" />
               <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white/40 group-hover:text-red-600 transition-colors">Architectural Signature</span>
            </div>
            <div className="relative">
              <span className="text-transparent bg-clip-text bg-angry-gradient text-5xl font-black italic tracking-tighter drop-shadow-[0_0_30px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform duration-700 whitespace-nowrap block">
                Hassan Deeb - Deeb Data
              </span>
              <div className="absolute -bottom-2 left-0 w-0 h-1 bg-angry-gradient group-hover:w-full transition-all duration-700" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
