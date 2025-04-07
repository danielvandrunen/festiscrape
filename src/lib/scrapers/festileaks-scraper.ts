import { BaseScraper } from './base-scraper';
import { Festival } from '../../types/festival';
import * as cheerio from 'cheerio';

export class FestileaksScraper extends BaseScraper {
  name = 'festileaks';
  baseUrl = 'https://festileaks.com/festivalagenda/';

  async scrape(): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const pages = await this.fetchAllPages(this.baseUrl, '.pagination .next');

    for (const html of pages) {
      const $ = cheerio.load(html);
      
      // Look for festival items in various containers
      $('.festival-item, [class*="festival-list"], [class*="event-list"], article').each((_, element) => {
        const $el = $(element);
        
        // Get the festival name from the title or heading
        const name = $el.find('h1, h2, h3, h4, .title, [class*="title"], [class*="name"], a').first().text()
          .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
          .replace(/Featured\s*/i, '')  // Remove "Featured" text
          .trim();
        
        // Skip if name is too short or contains navigation text
        if (name.length < 3 || /menu|login|register|inloggen|registreren|zoeken/i.test(name)) {
          return;
        }

        // Get the link
        const relativeUrl = $el.find('a').first().attr('href') || $el.closest('a').attr('href');
        const url = relativeUrl ? new URL(relativeUrl, this.baseUrl).toString() : undefined;

        // Get all text content
        const text = $el.text()
          .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
          .trim();

        // Try to extract date from the text
        const date = this.parseDutchDate(text) || new Date();

        // Try to extract location (usually ends with ", Country" or "in City")
        const locationMatch = text.match(/, ([^,]+)$/) || text.match(/in\s+([^,\.]+)$/i);
        const location = locationMatch ? locationMatch[1].trim() : '';

        if (name && url && !festivals.some(f => f.name === name)) {
          festivals.push({
            id: `festileaks-${name.toLowerCase().replace(/\s+/g, '-')}`,
            name,
            date,
            website: url,
            locations: location ? [location] : undefined,
            status: 'active',
            is_interested: false,
            is_favorite: false,
            source: 'festileaks',
            last_updated: new Date(),
            artists: [], // We'll need to scrape individual festival pages for artists
          });
        }
      });
    }

    return festivals;
  }
} 