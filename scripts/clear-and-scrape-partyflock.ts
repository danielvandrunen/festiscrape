import { clearAllFestivals, supabase } from './supabase-client.js';
import { PartyflockScraper } from './scrapers/partyflock.js';

async function main() {
  try {
    console.log('Clearing all festivals from the database...');
    const deletedCount = await clearAllFestivals();
    console.log(`Deleted ${deletedCount} festivals from the database.`);

    console.log('Running Partyflock scraper...');
    const scraper = new PartyflockScraper();
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
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 