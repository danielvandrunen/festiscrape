import { Festival } from '../../src/types';
import { BaseScraper } from './base-scraper.js';
import type { CheerioAPI } from 'cheerio';

export class PartyflockScraper extends BaseScraper {
  baseUrl = 'https://partyflock.nl/agenda/festivals';

  protected async parseFestivals($: CheerioAPI): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const now = new Date();

    // Updated selector for festival items - targeting the table rows specifically
    $('#agenda > tbody > tr').each((_, element) => { // Changed selector
      try {
        const $element = $(element);
        
        // Refined selectors based on typical Partyflock structure
        const nameElement = $element.find('td a strong'); // More specific selector for name
        const name = nameElement.text().trim();
        
        const dateElement = $element.find('td:nth-child(1)'); // Target the first column for date
        const dateText = dateElement.text().trim();
        
        const locationElement = $element.find('td a[href*="/location/"]'); // Target link containing /location/
        const location = locationElement.text().trim();
        
        const websiteElement = $element.find('td a[href*="/party/"]'); // Target link containing /party/
        let website = websiteElement.attr('href') || '';
        if (website && !website.startsWith('http')) {
          website = `https://partyflock.nl${website}`;
        }

        // Parse date using the base scraper's method - needs validation
        const date = this.parseDutchDate(dateText); // Assuming parseDutchDate can handle format like "za 12 apr"
        
        // Skip if no valid date or past festival
        if (!date || date < now) {
          // console.log(`Skipping: ${name} - Invalid/Past Date: ${dateText}`);
          return;
        }

        // Skip if name is too short or seems invalid
        if (name.length < 3 || /menu|login|register|inloggen|registreren|zoeken/i.test(name)) {
          // console.log(`Skipping: Invalid Name: ${name}`);
          return;
        }

        festivals.push({
          id: this.generateId(),
          name,
          date,
          website,
          locations: location ? [location] : [],
          source: 'partyflock',
          status: 'active',
          is_interested: false,
          last_updated: new Date()
        });
      } catch (error) {
        console.error('Error parsing Partyflock festival entry:', error);
      }
    });

    return festivals;
  }
} 