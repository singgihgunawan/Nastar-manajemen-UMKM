import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from './context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { AuthWrapper } from '@/components/AuthWrapper';
import { MobileHeader } from '@/components/MobileHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NastarKu - Manajemen UMKM',
  description: 'Aplikasi manajemen produksi dan penjualan kue kering (Nastar) untuk UMKM.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.className}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col md:flex-row pb-16 md:pb-0">
        <AppProvider>
          <AuthWrapper>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <MobileHeader />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-7xl mx-auto">
                {children}
              </main>
            </div>
            <MobileNav />
          </AuthWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
