import { clearAllFestivals, getSupabaseClient } from '../src/lib/supabase/client';
import { PartyflockScraper } from './scrapers/partyflock';

// Supabase credentials
const PROJECT_REF = 'ykbmxkzxbcfqjqfnqrqc';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrYm14a3p4YmNmcWpxZm5xcnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0OTY5NzAsImV4cCI6MjAyMzA3Mjk3MH0.Ue_WS1NHgiBVgX-TF0kYoVcT_vNviBDjg_lHHBUXvYE';

async function main() {
  try {
    const supabase = getSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
    
    console.log('Clearing all festivals from the database...');
    const deletedCount = await clearAllFestivals(SUPABASE_URL, SUPABASE_KEY);
    console.log(`Deleted ${deletedCount} festivals from the database.`);

    console.log('Running Partyflock scraper...');
    const scraper = new PartyflockScraper();
    console.log('Scraping festivals from Partyflock...');
    const festivals = await scraper.scrape();
    console.log(`Found ${festivals.length} festivals from Partyflock.`);

    // Insert festivals into the database
    console.log('Inserting festivals into the database...');
    const { data, error } = await supabase
      .from('festivals')
      .insert(festivals);

    if (error) {
      console.error('Error inserting festivals:', error);
      throw error;
    }

    console.log(`Successfully inserted ${festivals.length} festivals into the database.`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.stack : error);
    process.exit(1);
  }
}

main(); 