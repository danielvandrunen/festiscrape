import { NextResponse } from 'next/server';

// Mock data for testing
const mockScrapers = [
  {
    name: 'FestivalInfo',
    festivals: [
      {
        id: '1',
        name: 'Sunsation',
        date: '2025-04-04',
        website: 'https://example.com/sunsation',
        locations: ['Middelstum'],
        source: 'festivalinfo',
        status: 'active',
        is_interested: false,
        last_updated: new Date().toISOString(),
      },
    ],
  },
  {
    name: 'Festileaks',
    festivals: [
      {
        id: '2',
        name: 'DGTL',
        date: '2025-04-18',
        website: 'https://example.com/dgtl',
        locations: ['Amsterdam'],
        source: 'festileaks',
        status: 'active',
        is_interested: true,
        last_updated: new Date().toISOString(),
      },
    ],
  },
  {
    name: 'EBLive',
    festivals: [
      {
        id: '3',
        name: 'Sunsation',
        date: '2025-04-03',
        website: 'https://example.com/sunsation',
        locations: ['Middelstum'],
        source: 'eblive',
        status: 'active',
        is_interested: false,
        last_updated: new Date().toISOString(),
      },
    ],
  },
  {
    name: 'FollowTheBeat',
    festivals: [
      {
        id: '4',
        name: 'Kralingse Bos Festival',
        date: '2025-04-07',
        website: 'https://example.com/kralingse-bos',
        locations: ['Rotterdam'],
        source: 'followthebeat',
        status: 'active',
        is_interested: false,
        last_updated: new Date().toISOString(),
      },
    ],
  },
];

export async function GET() {
  return NextResponse.json(mockScrapers);
} 