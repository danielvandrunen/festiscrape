import { PartyflockScraper } from './scrapers/partyflock';
import { Festival } from '@/types';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const runScrapers = async () => {
  const scraper = new PartyflockScraper();
  const allFestivals: Festival[] = [];

  try {
    console.log('\nTesting with local HTML file...');
    const html = fs.readFileSync('test-data/festivals & strandfeesten · festival agenda.html', 'utf-8');
    const $ = cheerio.load(html);
    const festivals = await scraper.parseFestivals($);
    allFestivals.push(...festivals);
    console.log(`Found ${festivals.length} festivals`);
  } catch (error) {
    console.error('Error running PartyflockScraper:', error);
    return;
  }

  // Group festivals by month
  const festivalsByMonth = allFestivals.reduce((acc, festival) => {
    const month = festival.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(festival);
    return acc;
  }, {} as Record<string, Festival[]>);

  // Sort months chronologically
  const sortedMonths = Object.keys(festivalsByMonth).sort((a: string, b: string) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  // Display results
  console.log('\nFestivals by Month:');
  console.log('==================\n');

  for (const month of sortedMonths) {
    console.log(`${month}:`);
    const festivals = festivalsByMonth[month].sort((a: Festival, b: Festival) => a.date.getTime() - b.date.getTime());
    festivals.forEach((festival: Festival) => {
      const locations = festival.locations?.join(', ') || 'Location unknown';
      console.log(`  - ${festival.date.toLocaleDateString()}: ${festival.name} (${locations})`);
    });
    console.log('');
  }

  console.log(`Total festivals found: ${allFestivals.length}`);
};

runScrapers().catch(console.error); 