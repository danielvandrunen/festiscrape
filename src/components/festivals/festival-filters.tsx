import React from 'react';
import type { FestivalFilters } from '@/types';
import { Button } from '@/components/ui/button';

interface FestivalFiltersProps {
  filters: FestivalFilters;
  onFiltersChange: (filters: FestivalFilters) => void;
}

export function FestivalFilters({ filters, onFiltersChange }: FestivalFiltersProps) {
  const handleInputChange = (key: keyof FestivalFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={filters.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value || undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            placeholder="Enter location..."
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="minCapacity" className="block text-sm font-medium text-gray-700">
            Min Capacity
          </label>
          <input
            type="number"
            id="minCapacity"
            value={filters.minCapacity || ''}
            onChange={(e) => handleInputChange('minCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            placeholder="Enter minimum capacity..."
          />
        </div>
        <div>
          <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700">
            Max Capacity
          </label>
          <input
            type="number"
            id="maxCapacity"
            value={filters.maxCapacity || ''}
            onChange={(e) => handleInputChange('maxCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            placeholder="Enter maximum capacity..."
          />
        </div>
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value || undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            placeholder="Search festivals..."
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
} 