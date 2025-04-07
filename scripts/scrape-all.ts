import { createClient } from '@supabase/supabase-js';
import { FestileaksScraper } from './scrapers/festileaks.js';
import { FestivalInfoScraper } from './scrapers/festivalinfo.js';
import { EBLiveScraper } from './scrapers/eblive.js';
import { FollowTheBeatScraper } from './scrapers/followthebeat.js';
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
    ];

    // Run all scrapers in parallel
    const festivalArrays = await Promise.all(
      scrapers.map(async (scraper) => {
        console.log(`Running scraper: ${scraper.constructor.name}`);
        try {
          return await scraper.scrape();
        } catch (error) {
          console.error(`Error running scraper ${scraper.constructor.name}:`, error);
          return [];
        }
      })
    );

    // Flatten the arrays of festivals
    const festivals = festivalArrays.flat();

    console.log(`Found ${festivals.length} festivals`);

    // Upsert festivals to Supabase
    for (const festival of festivals) {
      const { error } = await supabase
        .from('festivals')
        .upsert(
          {
            ...festival,
            date: festival.date.toISOString(),
            last_updated: festival.last_updated.toISOString(),
          },
          {
            onConflict: 'id',
          }
        );

      if (error) {
        console.error(`Error upserting festival ${festival.name}:`, error);
      }
    }

    console.log('Finished updating festivals');
  } catch (error) {
    console.error('Error running scrapers:', error);
    process.exit(1);
  }
}

main(); 