import { Festival } from '../../src/types';
import { BaseScraper } from './base-scraper.js';
import type { CheerioAPI } from 'cheerio';

export class PartyflockScraper extends BaseScraper {
  baseUrl = 'https://partyflock.nl/agenda/festivals';

  protected async parseFestivals($: CheerioAPI): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const now = new Date();

    // Find all festival items
    $('.event-item, .festival-item, [class*="festival"]').each((_, element) => {
      try {
        const $element = $(element);
        
        // Try different selectors for name
        const name = $element.find('h2, h3, h4, .title, [class*="title"], [class*="name"]').first().text().trim();
        
        // Try different selectors for date
        const dateText = $element.find('.date, time, [class*="date"], [class*="time"]').first().text().trim();
        
        // Try different selectors for location
        const location = $element.find('.location, [class*="location"], [class*="venue"], [class*="place"]').first().text().trim();
        
        // Get the link
        const website = $element.find('a').first().attr('href') || '';

        // Parse date using the base scraper's method
        const date = this.parseDutchDate(dateText);
        
        // Skip if no valid date or past festival
        if (!date || date < now) return;

        // Skip if name is too short or contains navigation text
        if (name.length < 3 || /menu|login|register|inloggen|registreren|zoeken/i.test(name)) return;

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
        console.error('Error parsing festival:', error);
      }
    });

    return festivals;
  }
} 