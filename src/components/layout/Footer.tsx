"use client";

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex flex-col items-start">
            <span className="text-2xl font-headline font-bold text-gradient">DAKKAK SHOP</span>
            <span className="text-base uppercase tracking-wide text-fuchsia-500 font-bold mt-1">
              Powered By Hassan Deeb - Deeb Data
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover the future of shopping with our curated selection of high-end, futuristic products.
          </p>
        </div>
        <div>
          <h4 className="font-headline font-semibold mb-4 text-white">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Tech</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Fashion</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Lifestyle</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-semibold mb-4 text-white">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Shipping</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Returns</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">FAQ</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-semibold mb-4 text-white">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Dakkak Shop. All rights reserved.</p>
        <p className="mt-4 text-fuchsia-500 font-bold text-lg">Powered By Hassan Deeb - Deeb Data</p>
      </div>
    </footer>
  );
}
