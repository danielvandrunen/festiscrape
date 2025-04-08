'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export function Navbar() {
  const [partyflockCount, setPartyflockCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState<string | null>(null);

  // Fetch the Partyflock festival count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/festivals/count');
        if (!response.ok) {
          throw new Error('Failed to fetch count');
        }
        const data = await response.json();
        setPartyflockCount(data.count);
      } catch (error) {
        console.error('Error fetching Partyflock count:', error);
        setPartyflockCount(0);
      }
    };

    fetchCount();
  }, []);

  // Function to run the Partyflock scraper
  const runPartyflockScraper = async () => {
    setIsLoading(true);
    setScrapeStatus('Running scraper...');
    
    try {
      const response = await fetch('/api/scrape/partyflock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run scraper');
      }
      
      const data = await response.json();
      setScrapeStatus(`Success! ${data.count} festivals scraped.`);
      setPartyflockCount(data.count);
    } catch (error) {
      console.error('Error running scraper:', error);
      setScrapeStatus(error instanceof Error ? error.message : 'Error running scraper. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">FestiScrape</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link 
                href="/festivals" 
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                All Festivals
              </Link>
              <Link 
                href="/festivals/favorites" 
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                Favorites
              </Link>
              <Link 
                href="/festivals/archived" 
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                Archived
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Partyflock Festivals:
              </span>
              <span className="text-sm font-bold text-gray-900">
                {partyflockCount !== null ? partyflockCount : '...'}
              </span>
            </div>
            <Button 
              onClick={runPartyflockScraper} 
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="min-w-[120px]"
            >
              {isLoading ? 'Running...' : 'Rerun Scraper'}
            </Button>
            {scrapeStatus && (
              <div className="text-sm text-gray-500 animate-fade-in">
                {scrapeStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 