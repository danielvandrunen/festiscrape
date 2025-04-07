'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {mounted ? children : <div className="h-screen flex items-center justify-center">Loading...</div>}
      </main>
      <Footer />
    </div>
  );
} 