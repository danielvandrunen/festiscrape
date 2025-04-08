import { clearAllFestivals, getSupabaseClient } from '../src/lib/supabase/client';
import { PartyflockScraperSimple } from '../src/lib/scrapers/partyflock-scraper-simple';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

async function main() {
  try {
    console.log('Starting Partyflock scraping process...');
    console.log('Using Supabase URL:', SUPABASE_URL);
    
    // Initialize Supabase client
    const supabase = getSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Clear existing festivals
    console.log('Clearing existing festivals...');
    const deletedCount = await clearAllFestivals(SUPABASE_URL, SUPABASE_KEY);
    console.log(`Deleted ${deletedCount} existing festivals`);

    // Scrape new festivals
    console.log('Scraping festivals from Partyflock...');
    const scraper = new PartyflockScraperSimple();
    const festivals = await scraper.scrape();
    console.log(`Found ${festivals.length} festivals from Partyflock`);

    // Insert new festivals
    console.log('Inserting new festivals into database...');
    const { data, error } = await supabase
      .from('festivals')
      .insert(festivals);

    if (error) {
      throw error;
    }

    console.log('Successfully inserted festivals into database');
  } catch (error) {
    console.error('Error during scraping process:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

main(); 