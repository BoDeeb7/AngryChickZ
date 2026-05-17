"use client";

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-right" dir="rtl">
        <div className="space-y-4">
          <div className="flex flex-col items-start">
            <span className="text-2xl font-headline font-bold text-gradient">DAKKAK SHOP</span>
            <span className="text-sm uppercase tracking-wide text-fuchsia-500 font-bold mt-1">
              Powered By Hassan Deeb - Deeb Data
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            اكتشف مستقبل التسوق مع مجموعتنا المختارة من المنتجات الفاخرة والفريدة.
          </p>
        </div>
        <div>
          <h4 className="font-headline font-semibold mb-4 text-white">المتجر</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">تقنية</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">موضة</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">لايف ستايل</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">إكسسوارات</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-semibold mb-4 text-white">الدعم</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">الشحن</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">الإرجاع</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">الأسئلة الشائعة</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">اتصل بنا</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-semibold mb-4 text-white">الشركة</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">من نحن</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">سياسة الخصوصية</Link></li>
            <li><Link href="#" className="hover:text-fuchsia-500 transition-colors">شروط الخدمة</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Dakkak Shop. جميع الحقوق محفوظة.</p>
        <p className="mt-2 text-fuchsia-500 font-bold text-base">Powered By Hassan Deeb - Deeb Data</p>
      </div>
    </footer>
  );
}
