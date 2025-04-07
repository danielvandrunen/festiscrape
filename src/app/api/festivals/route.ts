import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase/client';
import { Festival, FestivalFilters } from '../../../types';

// Mock data for testing
const mockFestivals = [
  {
    id: '1',
    name: 'Sunsation',
    date: '2025-04-03',
    website: 'https://example.com/sunsation',
    locations: ['Middelstum'],
    source: 'festileaks',
    status: 'active',
    is_interested: false,
    is_favorite: false,
    notes: '',
    last_updated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'DGTL',
    date: '2025-04-18',
    website: 'https://example.com/dgtl',
    locations: ['Amsterdam'],
    source: 'festileaks',
    status: 'active',
    is_interested: true,
    is_favorite: true,
    notes: 'Check lineup',
    last_updated: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Kralingse Bos Festival',
    date: '2025-04-07',
    website: 'https://example.com/kralingse-bos',
    locations: ['Rotterdam'],
    source: 'festileaks',
    status: 'active',
    is_interested: false,
    is_favorite: false,
    notes: '',
    last_updated: new Date().toISOString(),
  },
];

// In-memory storage for favorite status (temporary until database is updated)
const favoriteStatus = new Map<string, boolean>();

// In-memory storage for notes (temporary until database is updated)
const festivalNotes = new Map<string, string>();

// Define a type for the database festival
interface DbFestival {
  id: string;
  name: string;
  date: string;
  website?: string;
  locations?: string[];
  source: string;
  status: string;
  is_interested: boolean;
  last_updated: string;
  [key: string]: any; // Allow for additional properties
}

export async function GET(request: Request) {
  console.log('Fetching festivals from Supabase...');
  
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const isFavorite = searchParams.get('is_favorite');
  
  try {
    // Build query
    let query = supabase
      .from('festivals')
      .select('*')
      .order('date', { ascending: true });
    
    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching festivals:', error);
      // If there's an error with the database, use mock data
      return NextResponse.json(mockFestivals);
    }

    // Remove test festival and deduplicate based on name and date
    const uniqueFestivals = data
      .filter((festival: DbFestival) => festival.name !== 'Test Festival 1')
      .reduce((acc, festival: DbFestival) => {
        const key = `${festival.name}-${festival.date}`;
        if (!acc.has(key)) {
          // Add is_favorite field from in-memory storage
          const festivalWithFavorite = {
            ...festival,
            is_favorite: favoriteStatus.get(festival.id) || false,
            notes: festivalNotes.get(festival.id) || ''
          };
          acc.set(key, festivalWithFavorite);
        }
        return acc;
      }, new Map())
      .values();

    let deduplicatedFestivals = Array.from(uniqueFestivals);
    
    // Filter by favorite status if requested
    if (isFavorite === 'true') {
      deduplicatedFestivals = deduplicatedFestivals.filter((festival: any) => festival.is_favorite);
    }

    console.log('Fetched festivals:', deduplicatedFestivals);
    return NextResponse.json(deduplicatedFestivals);
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(mockFestivals);
  }
}

export async function POST(request: Request) {
  const festival: Omit<Festival, 'id'> = await request.json();

  const { data, error } = await supabase
    .from('festivals')
    .insert([festival])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { id, ...updates } = await request.json();
  
  // Handle favorite status updates in memory
  if ('is_favorite' in updates) {
    favoriteStatus.set(id, updates.is_favorite);
    
    // Return success without updating the database
    return NextResponse.json({ 
      id, 
      is_favorite: updates.is_favorite,
      success: true 
    });
  }
  
  // Handle notes updates in memory
  if ('notes' in updates) {
    festivalNotes.set(id, updates.notes);
    
    // Return success without updating the database
    return NextResponse.json({ 
      id, 
      notes: updates.notes,
      success: true 
    });
  }

  // For other updates, try to update the database
  try {
    const { data, error } = await supabase
      .from('festivals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating festival:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH handler:', error);
    return NextResponse.json({ error: 'Failed to update festival' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('festivals')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 