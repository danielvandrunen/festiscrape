import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Festival, FestivalFilters } from '@/types';

interface FestivalListProps {
  festivals: Festival[];
  filters: FestivalFilters;
  onArchive: (festival: Festival) => void;
  onInterested: (festival: Festival) => void;
  onFetchUrl: (festival: Festival) => void;
}

export function FestivalList({
  festivals,
  filters,
  onArchive,
  onInterested,
  onFetchUrl,
}: FestivalListProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Website
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acts
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capacity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {festivals.map((festival) => (
            <tr key={festival.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(festival.date), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {festival.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {festival.website ? (
                  <a
                    href={festival.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit
                  </a>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFetchUrl(festival)}
                  >
                    Fetch URL
                  </Button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {festival.num_acts || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {festival.locations?.join(', ') || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {festival.capacity ? festival.capacity.toLocaleString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onArchive(festival)}
                  >
                    {festival.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </Button>
                  <Button
                    variant={festival.is_interested ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onInterested(festival)}
                  >
                    {festival.is_interested ? 'Interested' : 'Not Interested'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 