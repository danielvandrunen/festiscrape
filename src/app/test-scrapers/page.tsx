'use client';

import React, { useState, useEffect } from 'react';

interface Festival {
  id: string;
  name: string;
  date: string;
  website?: string;
  locations?: string[];
  source: string;
  status: string;
  is_interested: boolean;
  last_updated: string;
}

interface ScraperResult {
  name: string;
  festivals: Festival[];
}

export default function TestScrapersPage() {
  const [scrapers, setScrapers] = useState<ScraperResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScrapers();
  }, []);

  const fetchScrapers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-scrapers');
      if (!response.ok) throw new Error('Failed to fetch scrapers');
      const data = await response.json();
      setScrapers(data);
    } catch (error) {
      console.error('Error fetching scrapers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Test Scrapers</h1>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {scrapers.map((scraper) => (
            <div key={scraper.name} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">{scraper.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scraper.festivals.map((festival) => (
                  <div key={festival.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">{festival.name}</h3>
                    <p className="text-gray-600 mb-2">
                      {new Date(festival.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mb-2">
                      {festival.locations?.join(', ') || 'No location'}
                    </p>
                    {festival.website && (
                      <a
                        href={festival.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 