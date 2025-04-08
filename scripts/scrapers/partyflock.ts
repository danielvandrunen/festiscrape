import type { Festival } from '../../src/types';
import { BaseScraper } from './base-scraper';
import { load } from 'cheerio';

export class PartyflockScraper extends BaseScraper {
  baseUrl = 'https://partyflock.nl/agenda/festivals';

  public async parseFestivals($: ReturnType<typeof load>): Promise<Festival[]> {
    try {
      const festivals: Festival[] = [];

      // Try to find festival elements using schema.org Event type first
      let elements = $('[itemtype="http://schema.org/Event"]');
      
      // If no schema.org elements found, try alternative selectors
      if (elements.length === 0) {
        elements = $('.festival-item, .event-item, .agenda-item, article');
      }

      console.log(`Found ${elements.length} potential festival elements`);

      elements.each((_: number, element: cheerio.Element) => {
        try {
          const $element = $(element);
          
          // Try to get name from multiple possible locations
          const name = $element.find('[itemprop="name"], .event-name, h2, h3').first().text().trim();
          if (!name) {
            console.warn('Skipping element - no name found');
            return;
          }

          // Try to get date from multiple possible locations
          const dateText = $element.find('[itemprop="startDate"], .event-date, .date').first().text().trim();
          const date = this.parseDutchDate(dateText);
          if (!date) {
            console.warn(`Skipping ${name} - no valid date found in: ${dateText}`);
            return;
          }

          // Try to get location from multiple possible locations
          const locationText = $element.find('[itemprop="location"], .event-location, .location').first().text().trim();
          const locations = locationText ? [locationText] : [];

          // Try to get website from multiple possible locations
          const website = $element.find('[itemprop="url"], a[href]').first().attr('href') || '';

          festivals.push({
            id: this.generateId(),
            name,
            date,
            website,
            locations,
            source: 'partyflock',
            status: 'active',
            is_interested: false,
            last_updated: new Date()
          });

          console.log(`Successfully parsed festival: ${name}`);
        } catch (error) {
          console.error('Error parsing festival element:', error);
        }
      });

      return festivals;
    } catch (error) {
      console.error('Error parsing festivals:', error);
      throw error;
    }
  }
} 