import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

// Base URL for the Festileaks festival agenda
const BASE_URL = 'https://festileaks.com/festivalagenda/';

// Query parameters for the URL
const QUERY_PARAMS = {
  event_title: '',
  event_startdate: '2025-04-07',
  event_enddate: '2026-04-07',
  country_id: '0',
  city_id: '0',
  terrain_id: '0',
  artists: '',
  genres: '',
  label_slug: '',
  ticketprice_min: '0',
  ticketprice_max: '2650',
  cap_min: '0',
  cap_max: '1400000',
  weekender: 'true',
  soldout: 'true',
  cancelled: 'true',
  organizer: '0'
};

// Number of pages to scrape
const TOTAL_PAGES = 25;

// Directory to save the HTML files
const OUTPUT_DIR = path.join(process.cwd(), 'test-data', 'festileaks-pages');

async function scrapeFestileaksPages() {
  console.log('Starting to scrape Festileaks festival pages...');
  
  // Create the output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }
  
  // Scrape each page
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    try {
      console.log(`Scraping page ${page} of ${TOTAL_PAGES}...`);
      
      // Construct the URL with query parameters
      const queryString = new URLSearchParams({
        ...QUERY_PARAMS,
        pg: page.toString()
      }).toString();
      
      const url = `${BASE_URL}?${queryString}`;
      
      // Make the request
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Save the HTML to a file
      const fileName = `festileaks-page-${page}.html`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      
      fs.writeFileSync(filePath, response.data);
      console.log(`Saved page ${page} to ${filePath}`);
      
      // Add a delay to avoid overloading the server
      await setTimeout(2000); // 2 seconds delay between requests
      
    } catch (error) {
      console.error(`Error scraping page ${page}:`, error);
    }
  }
  
  console.log('Finished scraping all Festileaks pages!');
}

// Run the scraping function
scrapeFestileaksPages(); 