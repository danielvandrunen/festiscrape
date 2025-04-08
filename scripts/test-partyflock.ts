import { PartyflockScraper } from './scrapers/partyflock';
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const testPartyflockScraper = async () => {
  try {
    console.log('Testing Partyflock scraper...');
    
    // Create scraper instance
    console.log('Creating scraper instance...');
    const scraper = new PartyflockScraper();
    
    // Fetch the webpage
    console.log('Fetching webpage from:', scraper.baseUrl);
    try {
      const response = await axios.get(scraper.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"macOS"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      const html = response.data;
      
      // Save HTML response for inspection
      const testDataDir = path.join(process.cwd(), 'test-data');
      if (!fs.existsSync(testDataDir)) {
        fs.mkdirSync(testDataDir);
      }
      fs.writeFileSync(path.join(testDataDir, 'partyflock-response.html'), html);
      console.log('Saved HTML response to test-data/partyflock-response.html');
      
      // Load HTML into cheerio
      console.log('Loading HTML into cheerio...');
      const $ = cheerio.load(html);
      
      // Inspect HTML structure
      console.log('\nInspecting HTML structure:');
      console.log('=========================\n');
      
      // Log the first level of elements in the body
      console.log('Body children:');
      $('body').children().each((i, el) => {
        console.log(`${i + 1}. <${el.tagName}> with classes: ${$(el).attr('class') || 'none'}`);
      });
      
      // Look for any tables
      console.log('\nAll tables:');
      $('table').each((i, el) => {
        console.log(`${i + 1}. Table with classes: ${$(el).attr('class') || 'none'}`);
      });
      
      // Look for elements with 'festival' in their class name
      console.log('\nElements with "festival" in class:');
      $('[class*="festival"]').each((i, el) => {
        console.log(`${i + 1}. <${el.tagName}> with classes: ${$(el).attr('class')}`);
      });
      
      // Look for elements with schema.org Event type
      console.log('\nElements with schema.org Event type:');
      $('[itemtype="https://schema.org/Event"]').each((i, el) => {
        console.log(`${i + 1}. <${el.tagName}> with classes: ${$(el).attr('class') || 'none'}`);
      });
      
      // Parse festivals
      console.log('\nParsing festivals...');
      const festivals = await scraper.parseFestivals($);
      
      // Display results
      console.log('\nFound festivals:');
      console.log('================\n');
      
      festivals.forEach((festival, index) => {
        console.log(`${index + 1}. ${festival.name}`);
        console.log(`   Date: ${festival.date.toLocaleDateString()}`);
        console.log(`   Location: ${festival.locations?.join(', ') || 'N/A'}`);
        if (festival.website) {
          console.log(`   Website: ${festival.website}`);
        }
        console.log('');
      });
      
      console.log(`Total festivals found: ${festivals.length}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching webpage:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error('Unknown error occurred while fetching webpage');
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error testing Partyflock scraper:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

// Run the test and handle any unhandled promise rejections
process.on('unhandledRejection', (error: any) => {
  console.error('Unhandled promise rejection:', error instanceof Error ? error.message : String(error));
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
});

testPartyflockScraper().catch((error) => {
  console.error('Fatal error:', error instanceof Error ? error.message : String(error));
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
}); 