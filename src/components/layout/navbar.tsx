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
        const data = await response.json();
        setPartyflockCount(data.count);
      } catch (error) {
        console.error('Error fetching Partyflock count:', error);
      }
    };

    fetchCount();
  }, []);

  // Function to run the Partyflock scraper
  const runPartyflockScraper = async () => {
    setIsLoading(true);
    setScrapeStatus('Running scraper...');
    
    try {
      // In a real app, you would use a proper auth token
      const response = await fetch('/api/scrape/partyflock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token' // Replace with real auth in production
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setScrapeStatus(`Success! ${data.count} festivals scraped.`);
        // Refresh the count
        const countResponse = await fetch('/api/festivals/count');
        const countData = await countResponse.json();
        setPartyflockCount(countData.count);
      } else {
        setScrapeStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error running scraper:', error);
      setScrapeStatus('Error running scraper. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Partyflock: {partyflockCount !== null ? partyflockCount : '...'}
            </div>
            <Button 
              onClick={runPartyflockScraper} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? 'Running...' : 'Rerun Scraper'}
            </Button>
            {scrapeStatus && (
              <div className="text-xs text-gray-500">
                {scrapeStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 