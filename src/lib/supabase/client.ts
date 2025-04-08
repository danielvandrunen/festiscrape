import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient(url?: string, key?: string) {
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = getSupabaseClient();

/**
 * Clears all festivals from the database
 * @returns The number of deleted festivals
 */
export async function clearAllFestivals(url?: string, key?: string) {
  const client = getSupabaseClient(url, key);
  const { data, error, count } = await client
    .from('festivals')
    .delete()
    .neq('id', 'dummy-id'); // This ensures we delete all records
  
  if (error) {
    console.error('Error clearing festivals:', error);
    throw error;
  }
  
  return count || 0;
} 