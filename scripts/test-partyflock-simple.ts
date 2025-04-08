import { PartyflockScraperSimple } from '../src/lib/scrapers/partyflock-scraper-simple';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('Testing Partyflock scraper (simple version)...');
    
    const scraper = new PartyflockScraperSimple();
    const festivals = await scraper.scrape();
    
    console.log(`Scraped ${festivals.length} festivals from Partyflock`);
    
    // Save to JSON file for comparison
    const outputPath = path.join(process.cwd(), 'festivals-simple.json');
    fs.writeFileSync(outputPath, JSON.stringify(festivals, null, 2));
    console.log(`Saved festivals to ${outputPath}`);
    
    // Compare with existing festivals.json if it exists
    const existingPath = path.join(process.cwd(), 'festivals.json');
    if (fs.existsSync(existingPath)) {
      const existingFestivals = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
      console.log(`Found ${existingFestivals.length} festivals in existing file`);
      
      // Compare counts
      if (festivals.length === existingFestivals.length) {
        console.log('✅ Festival counts match!');
      } else {
        console.log(`❌ Festival counts don't match: ${festivals.length} vs ${existingFestivals.length}`);
      }
      
      // Compare first few entries
      const sampleSize = Math.min(5, festivals.length, existingFestivals.length);
      console.log(`\nComparing first ${sampleSize} entries:`);
      
      for (let i = 0; i < sampleSize; i++) {
        const newFestival = festivals[i];
        const existingFestival = existingFestivals[i];
        
        console.log(`\nFestival ${i + 1}:`);
        console.log(`  Name: ${newFestival.name} (${newFestival.name === existingFestival.name ? '✅' : '❌'})`);
        console.log(`  Date: ${newFestival.date} (${newFestival.date === existingFestival.date ? '✅' : '❌'})`);
        console.log(`  Location: ${newFestival.locations?.[0]} (${newFestival.locations?.[0] === existingFestival.locations?.[0] ? '✅' : '❌'})`);
      }
    }
    
  } catch (error) {
    console.error('Error testing Partyflock scraper:', error);
  }
}

main(); 