
import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'New Project | Powered By Hassan Deeb',
  description: 'Built from zero with Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} - Powered By Hassan Deeb - Deeb Data</p>
          </footer>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
