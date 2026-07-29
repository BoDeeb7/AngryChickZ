import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Angry ChickZ | Gourmet Fast Food',
  description: 'The spiciest, crunchiest chicken in town. Order now!',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden selection:bg-primary selection:text-white">
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
        <FirebaseClientProvider>
          <ThemeProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
