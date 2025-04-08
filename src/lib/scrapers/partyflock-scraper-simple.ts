import { Festival } from '../../types/festival';
import { BaseScraper } from './base-scraper';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { v4 as uuidv4 } from 'uuid';

export class PartyflockScraperSimple extends BaseScraper {
  name = 'Partyflock';
  baseUrl = 'https://partyflock.nl/agenda/festivals';

  public async scrape(): Promise<Festival[]> {
    try {
      console.log('Starting Partyflock scraper (simple version)...');
      
      let html: string;
      
      // Try to use the test data file first
      try {
        const testFilePath = resolve(process.cwd(), 'test-data', 'festivals & strandfeesten · festival agenda.html');
        console.log('Attempting to read test data file:', testFilePath);
        const buffer = readFileSync(testFilePath);
        html = iconv.decode(buffer, 'iso-8859-1');
        console.log('Successfully read test data file');
      } catch (error) {
        console.log('Test data file not found, fetching from website...');
        html = await this.fetchPage(this.baseUrl);
      }
      
      return this.parseFestivals(html);
    } catch (error) {
      console.error('Error in Partyflock scraper:', error);
      return [];
    }
  }

  private parseFestivals(html: string): Festival[] {
    const festivals: Festival[] = [];
    const $ = load(html, { decodeEntities: true });
    
    // Find all festival rows by looking for the event name spans
    const eventRows = $('span[itemprop="name"]').closest('tr');
    console.log(`Found ${eventRows.length} potential festival rows`);
    
    eventRows.each((_, element) => {
      try {
        const $row = $(element);
        
        // Extract name
        const name = $row.find('[itemprop="name"]').text().trim();
        if (!name) {
          console.warn('Skipping row - no name found');
          return;
        }
        console.log('Found festival:', name);
        
        // Extract date
        const dateStr = $row.find('[itemprop="startDate"]').attr('content');
        if (!dateStr) {
          console.warn(`Skipping ${name} - no date found`);
          return;
        }
        const date = new Date(dateStr);
        console.log('Date:', dateStr);
        
        // Extract location and city
        const locationCell = $row.find('td').eq(2);
        const location = locationCell.find('a').first().text().trim();
        const city = locationCell.find('span.light7 a').first().text().trim();
        console.log('Location:', location);
        console.log('City:', city);
        
        // Get country (default to Netherlands since it's partyflock.nl)
        const country = 'Netherlands';
        
        // Extract website
        const eventPath = $row.find('td').eq(1).find('a').first().attr('href');
        const website = eventPath ? `https://partyflock.nl${eventPath}` : undefined;
        console.log('Website:', website);
        
        // Create festival object
        const festival: Festival = {
          id: uuidv4(),
          name,
          date,
          website,
          locations: [`${location}, ${city}, ${country}`].filter(Boolean),
          source: 'partyflock',
          status: 'active',
          is_interested: false,
          is_favorite: false,
          last_updated: new Date(),
          artists: []
        };
        
        festivals.push(festival);
        console.log(`Successfully parsed festival: ${name}`);
      } catch (error) {
        console.error('Error processing festival row:', error);
      }
    });
    
    console.log(`Found ${festivals.length} festival entries`);
    return festivals;
  }
} 