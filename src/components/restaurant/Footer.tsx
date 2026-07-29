
'use client';

import { Flame, Instagram, Facebook, Twitter, Phone, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Flame className="h-8 w-8 text-red-600 fill-red-600" />
              <span className="text-3xl font-black italic tracking-tighter">
                ANGRY <span className="text-red-600">CHICKZ</span>
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              We don't just fry chicken, we master the heat. Experience the crunch that everyone is talking about.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black italic uppercase mb-6 text-red-600">Quick Bites</h4>
            <ul className="space-y-3 text-muted-foreground font-bold">
              <li><Link href="#menu" className="hover:text-white transition-colors">Burgers</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Crispy Meals</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Secret Sauces</Link></li>
              <li><Link href="#menu" className="hover:text-white transition-colors">Angry Add-ons</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black italic uppercase mb-6 text-red-600">Find Us</h4>
            <ul className="space-y-4 text-muted-foreground font-bold">
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-600" /> 123 Heat Street, Fire City
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-600" /> +1 (234) 567-890
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-red-600" /> Open Daily: 11AM - 11PM
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black italic uppercase mb-6 text-red-600">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Get the latest spicy news and offers.</p>
            <div className="relative">
              <input type="email" placeholder="Email Address" className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 focus:ring-1 focus:ring-red-600 outline-none" />
              <button className="absolute right-2 top-2 bottom-2 bg-red-600 hover:bg-red-700 px-4 rounded-lg text-xs font-bold uppercase tracking-wider">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground uppercase font-bold tracking-widest">
          <p>© {new Date().getFullYear()} Angry ChickZ. All Rights Reserved.</p>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] mb-1">Architected by</span>
            <span className="text-red-600 text-lg">Powered By Hassan Deeb - Deeb Data</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
