import './globals.css';
import { Inter } from 'next/font/google';
import React from 'react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FestiScrape - Festival Calendar Aggregator',
  description: 'Aggregate and track festivals across multiple sources',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl-NL" id="html" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link href="/" className="text-xl font-bold text-gray-900">
                      FestiScrape
                    </Link>
                  </div>
                  <nav className="ml-6 flex space-x-8">
                    <Link href="/festivals" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                      Festivals
                    </Link>
                    <Link href="/test-scrapers" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                      Test Scrapers
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 