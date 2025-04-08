import { PartyflockScraper } from '../src/lib/scrapers/partyflock-scraper';

async function main() {
  console.log('Testing Partyflock scraper...');
  const scraper = new PartyflockScraper();
  
  try {
    const festivals = await scraper.scrape();
    console.log(`✅ Success! Found ${festivals.length} festivals`);
    
    if (festivals.length > 0) {
      console.log('\nSample festivals:');
      festivals.slice(0, 5).forEach(festival => {
        console.log(`\n- ${festival.name}`);
        console.log(`  Date: ${festival.date.toLocaleDateString()}`);
        console.log(`  Location: ${festival.locations?.join(', ') || 'N/A'}`);
        console.log(`  Website: ${festival.website}`);
      });
    }
  } catch (error) {
    console.error('❌ Error testing Partyflock scraper:', error);
  }
}

main(); 