import { FestileaksScraper } from './scrapers/festileaks';

async function main() {
  try {
    const scraper = new FestileaksScraper();
    console.log('Starting Festileaks scraper...');
    
    const festivals = await scraper.scrape();
    
    console.log(`Found ${festivals.length} festivals:`);
    festivals.forEach((festival, index) => {
      console.log(`\nFestival ${index + 1}:`);
      console.log('Name:', festival.name);
      console.log('Date:', festival.date);
      console.log('Website:', festival.website || 'N/A');
      console.log('Location(s):', festival.locations?.join(', ') || 'Unknown');
      console.log('Source:', festival.source);
      console.log('Last Updated:', festival.last_updated);
    });
  } catch (error) {
    console.error('Error running scraper:', error);
    process.exit(1);
  }
}

main(); 