'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, addMonths, isSameMonth } from 'date-fns';
import Link from 'next/link';
import debounce from 'lodash/debounce';

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
  notes?: string;
}

interface FilterOptions {
  search: string;
  source: string;
  status: string;
  isInterested: boolean | null;
}

interface MonthGroup {
  month: Date;
  festivals: Festival[];
}

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    source: '',
    status: '',
    isInterested: null,
  });

  // Create a debounced version of the API call
  const debouncedNotesUpdate = useCallback(
    debounce(async (id: string, notes: string) => {
      try {
        const response = await fetch('/api/festivals', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            notes,
          }),
        });

        if (!response.ok) throw new Error('Failed to update notes');
      } catch (error) {
        console.error('Error updating notes:', error);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      console.log('Fetching festivals from API...');
      const response = await fetch('/api/festivals');
      if (!response.ok) throw new Error('Failed to fetch festivals');
      const data = await response.json();
      console.log('Received festivals:', data);
      setFestivals(data);
    } catch (error) {
      console.error('Error fetching festivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFilters(prev => ({
        ...prev,
        [name]: checkbox.checked ? true : null,
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNotesChange = (id: string, notes: string) => {
    setFestivals(prevFestivals => 
      prevFestivals.map(festival => 
        festival.id === id ? { ...festival, notes } : festival
      )
    );
    debouncedNotesUpdate(id, notes);
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch('/api/festivals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: 'archived',
        }),
      });

      if (!response.ok) throw new Error('Failed to archive festival');
      fetchFestivals();
    } catch (error) {
      console.error('Error archiving festival:', error);
    }
  };

  const handleToggleFavorite = async (id: string, currentFavoriteStatus: boolean) => {
    try {
      const response = await fetch('/api/festivals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_favorite: !currentFavoriteStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update favorite status');
      fetchFestivals();
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  // Group festivals by month
  const groupFestivalsByMonth = (festivals: Festival[]): MonthGroup[] => {
    const groups = festivals.reduce((acc, festival) => {
      const date = parseISO(festival.date);
      const monthStart = startOfMonth(date);
      const key = monthStart.toISOString();

      if (!acc[key]) {
        acc[key] = {
          month: monthStart,
          festivals: [],
        };
      }

      acc[key].festivals.push(festival);
      return acc;
    }, {} as Record<string, MonthGroup>);

    return Object.values(groups).sort((a, b) => a.month.getTime() - b.month.getTime());
  };

  // Filter festivals based on current filters
  const filteredFestivals = festivals.filter(festival => {
    const matchesSearch = festival.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      festival.locations?.some(loc => loc.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesSource = !filters.source || festival.source === filters.source;
    const matchesStatus = !filters.status || festival.status === filters.status;
    const matchesInterested = filters.isInterested === null || festival.is_interested === filters.isInterested;

    return matchesSearch && matchesSource && matchesStatus && matchesInterested;
  });

  // Get unique sources and statuses for filters
  const sources = Array.from(new Set(festivals.map(f => f.source)));
  const statuses = Array.from(new Set(festivals.map(f => f.status)));

  // Group filtered festivals by month
  const monthGroups = groupFestivalsByMonth(filteredFestivals);

  // Navigation functions for months
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Get festivals for current month
  const currentMonthFestivals = filteredFestivals.filter(festival => 
    isSameMonth(parseISO(festival.date), currentMonth)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Festivals</h1>
            <div className="flex items-center space-x-4">
              <Link 
                href="/festivals/archived" 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Archived Festivals
              </Link>
              <Link 
                href="/festivals/favorites"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Favorite Festivals
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <h2 className="text-base font-medium text-gray-700 mb-4">Filters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search festivals..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={filters.source}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Sources</option>
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isInterested"
                      checked={filters.isInterested === true}
                      onChange={handleFilterChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">Interested Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ←&nbsp;Previous Month
            </button>
            <h2 className="text-lg font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={goToNextMonth}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next Month&nbsp;→
            </button>
          </div>
        </div>

        {/* Festival List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading festivals...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Festival
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMonthFestivals.length > 0 ? (
                    currentMonthFestivals.map((festival) => (
                      <tr key={festival.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
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
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(parseISO(festival.date), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {festival.locations?.join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {festival.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleToggleFavorite(festival.id, festival.is_favorite)}
                              className={`text-yellow-400 hover:text-yellow-500 focus:outline-none ${
                                festival.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                              }`}
                            >
                              ★
                            </button>
                            <button
                              onClick={() => handleArchive(festival.id)}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 bg-gray-50">
                        <p className="font-medium">No festivals found</p>
                        <p className="mt-1">There are no festivals scheduled for {format(currentMonth, 'MMMM yyyy')}.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 