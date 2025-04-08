import { FestivalInfoScraper } from './scrapers/festivalinfo-scraper';
import { FestileaksScraper } from './scrapers/festileaks-scraper';
import { EBLiveScraper } from './scrapers/eblive-scraper';
import { FollowTheBeatScraper } from './scrapers/followthebeat-scraper';
import { PartyflockScraper } from './scrapers/partyflock-scraper';

async function testScraper(name: string, scraper: any) {
  console.log(`\nTesting ${name} scraper...`);
  try {
    const festivals = await scraper.scrape();
    console.log(`✅ Success! Found ${festivals.length} festivals`);
    if (festivals.length > 0) {
      console.log('Sample festival:', festivals[0]);
    }
  } catch (error) {
    console.error(`❌ Error scraping ${name}:`, error);
  }
}

async function testAllScrapers() {
  const scrapers = [
    { name: 'FestivalInfo', scraper: new FestivalInfoScraper() },
    { name: 'Festileaks', scraper: new FestileaksScraper() },
    { name: 'EBLive', scraper: new EBLiveScraper() },
    { name: 'FollowTheBeat', scraper: new FollowTheBeatScraper() },
    { name: 'Partyflock', scraper: new PartyflockScraper() },
  ];

  for (const { name, scraper } of scrapers) {
    await testScraper(name, scraper);
  }
}

export { testAllScrapers }; 