import React, { useState } from 'react';
import { Festival, ScrapeResult } from '../types/festival';

export default function FestivalScraper() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data: ScrapeResult = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to scrape festival lineup');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Festival Lineup Scraper</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter festival lineup URL"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Scraping...' : 'Scrape Lineup'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result?.data && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{result.data.name}</h2>
          
          <div className="space-y-4">
            {result.data.artists.map((artist, index) => (
              <div key={index} className="border-b pb-2">
                <h3 className="font-semibold">{artist.name}</h3>
                <div className="text-sm text-gray-600">
                  {artist.day && <span>Day: {artist.day}</span>}
                  {artist.stage && <span className="ml-4">Stage: {artist.stage}</span>}
                  {artist.time && <span className="ml-4">Time: {artist.time}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 