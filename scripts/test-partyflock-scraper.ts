import { PartyflockScraper } from './scrapers/partyflock.js';
import type { Festival } from '../src/types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPartyflockScraper() {
  try {
    console.log('Testing Partyflock scraper...');
    
    // Initialize scraper
    const scraper = new PartyflockScraper();
    
    // Test scraping
    console.log('Attempting to scrape festivals...');
    const festivals = await scraper.scrape();
    
    // Validate results
    console.log(`Found ${festivals.length} festivals.`);
    
    if (festivals.length === 0) {
      throw new Error('No festivals found. The scraper might be broken.');
    }
    
    // Test a sample festival
    const sampleFestival = festivals[0];
    console.log('\nValidating sample festival:');
    console.log(JSON.stringify(sampleFestival, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'date', 'locations', 'website', 'source'] as const;
    const missingFields = requiredFields.filter(field => !sampleFestival[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate date format
    const date = new Date(sampleFestival.date);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Validate website URL
    if (!sampleFestival.website) {
      throw new Error('Website URL is missing');
    }
    
    try {
      new URL(sampleFestival.website);
    } catch {
      throw new Error('Invalid website URL');
    }
    
    console.log('\nAll tests passed! The scraper is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed:', error);
    process.exit(1);
  }
}

testPartyflockScraper(); 