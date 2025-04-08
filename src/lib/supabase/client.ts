import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient(url?: string, key?: string) {
  if (!url || !key) {
    throw new Error('Supabase URL and key must be provided');
  }

  console.log('Creating Supabase client with URL:', url);
  return createClient(url, key);
}

/**
 * Clears all festivals from the database
 * @returns The number of deleted festivals
 */
export async function clearAllFestivals(url?: string, key?: string) {
  if (!url || !key) {
    throw new Error('Supabase URL and key must be provided');
  }

  console.log('Initializing Supabase client for clearing festivals...');
  const client = getSupabaseClient(url, key);

  try {
    console.log('Attempting to delete festivals...');
    const { data, error, count } = await client
      .from('festivals')
      .delete()
      .eq('source', 'partyflock'); // Only delete Partyflock festivals
    
    if (error) {
      console.error('Database error clearing festivals:', error);
      throw error;
    }

    console.log('Successfully deleted festivals. Count:', count);
    return count || 0;
  } catch (error) {
    console.error('Error in clearAllFestivals:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
} 