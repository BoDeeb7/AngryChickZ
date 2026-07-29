
'use client';

import { Instagram, Facebook, Twitter, Phone, MapPin, Clock, ArrowUp, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0b0c10] pt-24 pb-12 overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-red-600 shadow-xl group-hover:rotate-3 transition-transform">
                <Image src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=200&h=200&auto=format&fit=crop" alt="Logo" fill className="object-cover" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                ANGRY <span className="text-red-600">CHICKZ</span>
              </span>
            </Link>
            <p className="text-white/40 leading-relaxed font-medium">
              Defining the standard of premium fast food. Quality ingredients, bold flavors, and an unforgettable heat.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-10 w-10 rounded-xl glass-panel flex items-center justify-center hover:bg-red-600 transition-all duration-300 group">
                  <Icon className="h-5 w-5 text-white group-hover:scale-110" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] mb-8 text-red-600">Quick Links</h4>
            <ul className="space-y-4 text-white/40 font-bold text-sm uppercase tracking-wider">
              <li><Link href="#menu" className="hover:text-white transition-colors">Burgers</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Crispy Buckets</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Locations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] mb-8 text-red-600">Contact Us</h4>
            <ul className="space-y-6 text-white/40 font-medium">
              <li className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-red-600 shrink-0" /> 
                <span className="text-sm">Sector 7, Heat District, Fire City</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-red-600 shrink-0" /> 
                <span className="text-sm">+961 70 105 152</span>
              </li>
              <li className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-red-600 shrink-0" /> 
                <span className="text-sm">Daily: 11:00 AM - 11:00 PM</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] mb-8 text-red-600">Newsletter</h4>
            <p className="text-sm text-white/40 mb-6 font-medium">Subscribe for special offers and new flavors.</p>
            <div className="relative">
              <input type="email" placeholder="Email Address" className="w-full h-12 glass-panel rounded-xl px-4 text-white text-sm outline-none focus:ring-1 focus:ring-red-600" />
              <button className="absolute right-1 top-1 bottom-1 bg-red-600 hover:bg-red-700 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white transition-all">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">© 2024 ANGRY CHICKZ. All Rights Reserved.</p>
          
          <button onClick={scrollToTop} className="h-10 w-10 glass-panel rounded-full flex items-center justify-center hover:bg-white/5 transition-all">
            <ArrowUp className="h-4 w-4 text-white/40" />
          </button>

          <div className="flex flex-col items-center md:items-end group">
            <div className="flex items-center gap-2 mb-2">
               <Zap className="h-3 w-3 text-red-600 fill-red-600" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 group-hover:text-red-600 transition-colors">Developed By</span>
            </div>
            <span className="text-transparent bg-clip-text bg-angry-gradient text-3xl font-extrabold italic tracking-tight drop-shadow-lg group-hover:scale-105 transition-transform duration-500">
              Hassan Deeb - Deeb Data
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
