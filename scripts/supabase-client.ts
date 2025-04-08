import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://bezlkvvsjdgcuoibixhv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemxrdnZzamRnY3VvaWJpeGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMTIwNDAsImV4cCI6MjA1OTU4ODA0MH0.UDCsfniooL5lS5aap_EUtQrNoNiaa2tmpmm-c-Jrdv8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Clears all festivals from the database
 * @returns The number of deleted festivals
 */
export async function clearAllFestivals() {
  const { data, error, count } = await supabase
    .from('festivals')
    .delete()
    .eq('source', 'partyflock'); // Only delete Partyflock festivals
  
  if (error) {
    console.error('Error clearing festivals:', error);
    throw error;
  }
  
  return count || 0;
} 