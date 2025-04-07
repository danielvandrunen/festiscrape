import { BaseScraper } from './base-scraper';
import { Festival } from '../../types/festival';
import * as cheerio from 'cheerio';

export class FollowTheBeatScraper extends BaseScraper {
  name = 'followthebeat';
  baseUrl = 'https://followthebeat.nl/agenda/';

  async scrape(): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const pages = await this.fetchAllPages(this.baseUrl, '.pagination .next');

    for (const html of pages) {
      const $ = cheerio.load(html);
      
      // Look for festival items in h2 and h3 elements
      $('h2, h3').each((_, element) => {
        const $el = $(element);
        
        // Get the festival name from the heading
        const name = $el.text()
          .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
          .replace(/Featured\s*/i, '')  // Remove "Featured" text
          .trim();
        
        // Skip if name is too short or contains navigation text
        if (name.length < 3 || /menu|login|register|inloggen|registreren|zoeken|bekijk/i.test(name)) {
          return;
        }

        // Get the text before and after the heading for date and location
        const $prev = $el.prev();
        const $next = $el.next();
        const prevText = $prev.text().trim();
        const nextText = $next.text().trim();

        // Try to extract date from the text before the heading
        const date = this.parseDutchDate(prevText) || new Date();

        // Try to extract location from the text after the heading
        const locationMatch = nextText.match(/, ([^,]+)$/) || nextText.match(/in\s+([^,\.]+)$/i);
        const location = locationMatch ? locationMatch[1].trim() : '';

        // Get the link
        const relativeUrl = $el.find('a').first().attr('href') || $el.closest('a').attr('href');
        const url = relativeUrl ? new URL(relativeUrl, this.baseUrl).toString() : undefined;

        if (name && url && !festivals.some(f => f.name === name)) {
          festivals.push({
            id: `followthebeat-${name.toLowerCase().replace(/\s+/g, '-')}`,
            name,
            date,
            website: url,
            locations: location ? [location] : undefined,
            status: 'active',
            is_interested: false,
            is_favorite: false,
            source: 'followthebeat',
            last_updated: new Date(),
            artists: [], // We'll need to scrape individual festival pages for artists
          });
        }
      });
    }

    return festivals;
  }
} 