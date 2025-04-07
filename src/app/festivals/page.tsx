'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
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
    // Update local state immediately
    setFestivals(prevFestivals => 
      prevFestivals.map(festival => 
        festival.id === id ? { ...festival, notes } : festival
      )
    );
    
    // Debounce the API call
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
      
      // Refresh the list
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
      
      // Refresh the list
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
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Get festivals for current month
  const currentMonthFestivals = monthGroups.find(group => 
    startOfMonth(group.month).getTime() === startOfMonth(currentMonth).getTime()
  )?.festivals || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Festivals</h1>
        <div className="flex space-x-4">
          <Link href="/festivals/archived" className="text-blue-600 hover:text-blue-800">
            Archived Festivals
          </Link>
          <Link href="/festivals/favorites" className="text-blue-600 hover:text-blue-800">
            Favorite Festivals
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-semibold">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search festivals..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
            <select
              id="source"
              name="source"
              value={filters.source}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isInterested"
              name="isInterested"
              checked={filters.isInterested === true}
              onChange={handleFilterChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isInterested" className="ml-2 block text-sm text-gray-700">
              Interested Only
            </label>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <button
          onClick={goToPreviousMonth}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous Month
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={goToNextMonth}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Next Month
        </button>
      </div>
      
      {/* Festival List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Responsive table container */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Festival
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMonthFestivals.length > 0 ? (
                  currentMonthFestivals.map((festival) => (
                    <tr key={festival.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{festival.name}</div>
                          {festival.website && (
                            <a
                              href={festival.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              Visit Website
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(festival.date), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {festival.locations?.join(', ') || 'N/A'}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {festival.source}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4">
                        <textarea
                          value={festival.notes || ''}
                          onChange={(e) => handleNotesChange(festival.id, e.target.value)}
                          className="w-full text-sm text-gray-900 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          rows={1}
                          placeholder="Add notes..."
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          {festival.status === 'active' && (
                            <button
                              onClick={() => handleArchive(festival.id)}
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                              title="Archive festival"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleFavorite(festival.id, festival.is_favorite)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 ${
                              festival.is_favorite 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                            }`}
                            title={festival.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {festival.is_favorite ? '★' : '☆'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No festivals found for {format(currentMonth, 'MMMM yyyy')}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 