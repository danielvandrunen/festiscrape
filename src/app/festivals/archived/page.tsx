'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

// Define the Festival type inline
interface Festival {
  id: string;
  name: string;
  date: string;
  website?: string;
  locations?: string[];
  source: string;
  status: string;
  is_interested: boolean;
  is_favorite: boolean;
  last_updated: string;
}

export default function ArchivedFestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedFestivals();
  }, []);

  const fetchArchivedFestivals = async () => {
    try {
      setLoading(true);
      console.log('Fetching archived festivals from API...');
      const response = await fetch('/api/festivals?status=archived');
      if (!response.ok) throw new Error('Failed to fetch archived festivals');
      const data = await response.json();
      console.log('Received archived festivals:', data);
      setFestivals(data);
    } catch (error) {
      console.error('Error fetching archived festivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const response = await fetch('/api/festivals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: 'active',
        }),
      });

      if (!response.ok) throw new Error('Failed to unarchive festival');
      
      // Refresh the list
      fetchArchivedFestivals();
    } catch (error) {
      console.error('Error unarchiving festival:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Archived Festivals</h1>
        <Link href="/festivals" className="text-blue-600 hover:text-blue-800">
          Back to All Festivals
        </Link>
      </div>
      
      {/* Festival List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {festivals.length > 0 ? (
                festivals.map((festival) => (
                  <tr key={festival.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{festival.name}</div>
                      {festival.website && (
                        <a
                          href={festival.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Visit Website
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(festival.date), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {festival.locations?.join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {festival.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleUnarchive(festival.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Unarchive
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No archived festivals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 