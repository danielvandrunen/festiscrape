import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient(url?: string, key?: string) {
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  console.log('Creating Supabase client with URL:', supabaseUrl);
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Export a default client instance
export const supabase = getSupabaseClient();

/**
 * Clears all festivals from the database
 * @returns The number of deleted festivals
 */
export async function clearAllFestivals(url?: string, key?: string) {
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