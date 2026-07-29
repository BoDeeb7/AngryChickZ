'use client';

import { Flame, Instagram, Facebook, Twitter, Phone, MapPin, Clock, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black pt-32 pb-16 overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-20 mb-32">
          <div className="space-y-10 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-2xl">
                <Flame className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="text-3xl font-black italic tracking-tighter text-white">
                ANGRY <span className="text-red-600">CHICKZ</span>
              </span>
            </Link>
            <p className="text-white/40 leading-relaxed font-medium">
              We define the standard of high-heat gourmet dining. Precision frying, secret spice chemistry, and absolute flavor dominance.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-14 w-14 rounded-2xl glass-panel flex items-center justify-center hover:bg-red-600 transition-all group">
                  <Icon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black italic uppercase tracking-[0.4em] mb-10 text-red-600">Menu Vault</h4>
            <ul className="space-y-5 text-white/60 font-black uppercase italic tracking-tighter text-lg">
              <li><Link href="#menu" className="hover:text-white transition-colors">Burgers & Buns</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Crispy Buckets</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Dark Sauces</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Liquid Assets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black italic uppercase tracking-[0.4em] mb-10 text-red-600">Headquarters</h4>
            <ul className="space-y-6 text-white/60 font-medium">
              <li className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-red-600" /> 
                <span className="font-black uppercase italic tracking-tighter">123 Heat Sector, Fire District</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-red-600" /> 
                <span className="font-black uppercase italic tracking-tighter">+961 70 105 152</span>
              </li>
              <li className="flex items-center gap-4">
                <Clock className="h-6 w-6 text-red-600" /> 
                <span className="font-black uppercase italic tracking-tighter">Every Day: 11AM - 11PM</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black italic uppercase tracking-[0.4em] mb-10 text-red-600">Intelligence</h4>
            <p className="text-sm text-white/40 mb-6 font-medium">Receive classified updates and spicy intel.</p>
            <div className="relative">
              <input type="email" placeholder="VIP EMAIL ADDRESS" className="w-full h-16 glass-panel rounded-3xl px-6 text-white uppercase font-black italic tracking-tighter placeholder:text-white/20 focus:ring-1 focus:ring-red-600 outline-none" />
              <button className="absolute right-2 top-2 bottom-2 bg-red-600 hover:bg-red-700 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-colors">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.6em]">© {new Date().getFullYear()} Angry ChickZ Global. Operations Secure.</p>
          
          <button onClick={scrollToTop} className="flex flex-col items-center gap-2 group">
            <ArrowUpCircle className="h-8 w-8 text-white/20 group-hover:text-red-600 transition-colors" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Extraction</span>
          </button>

          <div className="flex flex-col items-center md:items-end group">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Developed By</span>
            <span className="text-transparent bg-clip-text bg-angry-gradient text-2xl font-black italic tracking-tighter group-hover:scale-105 transition-transform duration-500">
              Hassan Deeb - Deeb Data
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}