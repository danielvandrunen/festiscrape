'use client';

import Link from 'next/link';
import React from 'react';

export function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FestiScrape</h1>
            </div>
            <nav className="ml-6 flex space-x-8">
              <Link href="/festivals" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                All Festivals
              </Link>
              <Link href="/festivals/interested" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                Interested
              </Link>
              <Link href="/festivals/archived" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                Archived
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
} 