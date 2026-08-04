import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { AmbientSparks } from '@/components/restaurant/AmbientSparks';
import { FloatingCart } from '@/components/restaurant/FloatingCart';

export const metadata: Metadata = {
  title: 'Angry ChickZ | Gourmet Fast Food',
  description: 'Angry ChickZ Official Ordering & Menu App',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Angry ChickZ',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f59e0b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden selection:bg-primary selection:text-white">
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
        <FirebaseClientProvider>
          <ThemeProvider>
            <CartProvider>
              <AmbientSparks />
              {children}
              <FloatingCart />
              <Toaster />
            </CartProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}