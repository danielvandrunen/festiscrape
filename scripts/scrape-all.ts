import { createClient } from '@supabase/supabase-js';
import { FestileaksScraper } from './scrapers/festileaks.js';
import { FestivalInfoScraper } from './scrapers/festivalinfo.js';
import { EBLiveScraper } from './scrapers/eblive.js';
import { FollowTheBeatScraper } from './scrapers/followthebeat.js';
import { PartyflockScraper } from './scrapers/partyflock.js';
import type { Festival } from '../src/types';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  try {
    // Initialize scrapers
    const scrapers = [
      new FestileaksScraper(),
      new FestivalInfoScraper(),
      new EBLiveScraper(),
      new FollowTheBeatScraper(),
      new PartyflockScraper(),
    ];

    // Run each scraper sequentially and store results separately
    for (const scraper of scrapers) {
      console.log(`\nRunning scraper: ${scraper.constructor.name}`);
      try {
        const festivals = await scraper.scrape();
        console.log(`Found ${festivals.length} festivals from ${scraper.constructor.name}`);

        // Insert all festivals from this scraper
        console.log(`Inserting ${festivals.length} festivals from ${scraper.constructor.name}...`);
        for (const festival of festivals) {
          const { error } = await supabase
            .from('festivals')
            .insert({
              ...festival,
              date: festival.date.toISOString(),
              last_updated: festival.last_updated.toISOString(),
            });

          if (error) {
            console.error(`Error inserting festival ${festival.name}:`, error);
          }
        }
        console.log(`Finished inserting festivals from ${scraper.constructor.name}`);
      } catch (error) {
        console.error(`Error running scraper ${scraper.constructor.name}:`, error);
      }
    }

    // Get total count after all insertions
    const { count, error } = await supabase
      .from('festivals')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting total count:', error);
    } else {
      console.log(`\nTotal festivals in database: ${count}`);
    }

    // Get count by source
    const sources = ['festileaks', 'festivalinfo', 'eblive', 'followthebeat', 'partyflock'];
    console.log('\nFestivals by source:');
    
    for (const source of sources) {
      const { count, error: countError } = await supabase
        .from('festivals')
        .select('*', { count: 'exact', head: true })
        .eq('source', source);

      if (countError) {
        console.error(`Error getting count for ${source}:`, countError);
      } else {
        console.log(`${source}: ${count} festivals`);
      }
    }

    console.log('\nFinished updating festivals');
  } catch (error) {
    console.error('Error running scrapers:', error);
    process.exit(1);
  }
}

main(); 