import { createClient } from '@supabase/supabase-js';
import { PartyflockScraper } from './scrapers/partyflock';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const scrapers = [new PartyflockScraper()];
  const allFestivals = [];

  for (const scraper of scrapers) {
    try {
      console.log(`Starting scraper: ${scraper.constructor.name}`);
      const festivals = await scraper.scrape();
      allFestivals.push(...festivals);
      console.log(`Found ${festivals.length} festivals from ${scraper.constructor.name}`);
    } catch (error) {
      console.error(`Error in ${scraper.constructor.name}:`, error);
    }
  }

  if (allFestivals.length > 0) {
    try {
      console.log('Inserting festivals into database...');
      const { data, error } = await supabase
        .from('festivals')
        .upsert(allFestivals, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      console.log(`Successfully inserted ${allFestivals.length} festivals`);
    } catch (error) {
      console.error('Error inserting festivals:', error);
      throw error;
    }
  } else {
    console.log('No festivals found to insert');
  }
}

main().catch(console.error); 