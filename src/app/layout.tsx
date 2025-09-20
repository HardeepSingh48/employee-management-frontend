'use client';
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/layout/MainLayout';
import AuthInitializer from '@/components/auth/AuthInitializer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <AuthInitializer>
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster />
          </AuthInitializer>
        </Provider>
      </body>
    </html>
  );
}