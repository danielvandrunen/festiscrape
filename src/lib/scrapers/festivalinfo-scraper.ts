import { BaseScraper } from './base-scraper';
import { Festival } from '../../types/festival';
import * as cheerio from 'cheerio';

export class FestivalInfoScraper extends BaseScraper {
  name = 'festivalinfo';
  baseUrl = 'https://www.festivalinfo.nl/festivals/';

  async scrape(): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const pages = await this.fetchAllPages(this.baseUrl, '.pagination .next');

    for (const html of pages) {
      const $ = cheerio.load(html);
      
      // First try to find schema.org festival data
      $('script[type="application/ld+json"]').each((_, element) => {
        try {
          const data = JSON.parse($(element).html() || '');
          if (data['@type'] === 'Festival') {
            const name = data.name.replace(/\s+\d+$/, ''); // Remove year from name if present
            const url = data.url;
            const date = data.startDate ? new Date(data.startDate) : new Date();
            const location = data.location?.address?.addressLocality || '';

            if (name && url && !festivals.some(f => f.name === name)) {
              festivals.push({
                id: `festivalinfo-${name.toLowerCase().replace(/\s+/g, '-')}`,
                name,
                date,
                website: url,
                locations: location ? [location] : undefined,
                status: 'active',
                is_interested: false,
                is_favorite: false,
                source: 'festivalinfo',
                last_updated: new Date(),
                artists: [], // We'll need to scrape individual festival pages for artists
              });
            }
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      });

      // If no schema.org data found, try regular HTML parsing
      if (festivals.length === 0) {
        $('.festival-item, [class*="festival-list"], [class*="event-list"], tr[id^="festival"]').each((_, element) => {
          const $el = $(element);
          
          // Get the festival name from the title or heading
          const name = $el.find('h1, h2, h3, h4, .title, [class*="title"], [class*="name"], a').first().text()
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .replace(/^(?:festival|event):\s*/i, '')  // Remove "Festival:" or "Event:" prefix
            .replace(/\s+\d+$/, '') // Remove year from name if present
            .trim();
          
          // Skip if name is too short or contains navigation text
          if (name.length < 3 || /menu|login|register|inloggen|registreren|zoeken/i.test(name)) {
            return;
          }

          // Get the link
          const relativeUrl = $el.find('a').first().attr('href') || $el.closest('a').attr('href');
          const url = relativeUrl ? new URL(relativeUrl, this.baseUrl).toString() : undefined;

          // Try multiple possible date/location selectors
          const dateText = $el.find('[class*="date"], [class*="time"], time, .meta, [class*="when"]').first().text()
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .trim();
          const locationText = $el.find('[class*="location"], [class*="venue"], [class*="place"], [class*="where"]').first().text()
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .trim();

          // Get all text content
          const text = $el.text()
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .trim();

          // Try to extract date from specific elements or full text
          let date = dateText ? this.parseDutchDate(dateText) : undefined;
          if (!date) {
            date = this.parseDutchDate(text) || new Date();
          }

          // Try to extract location from specific elements or full text
          let location = locationText;
          if (!location) {
            const locationMatch = text.match(/(?:in|te|at)\s+([^,\.]+)/i) || text.match(/, ([^,\.]+)$/);
            location = locationMatch ? locationMatch[1].trim() : '';
          }

          if (name && url && !festivals.some(f => f.name === name)) {
            festivals.push({
              id: `festivalinfo-${name.toLowerCase().replace(/\s+/g, '-')}`,
              name,
              date,
              website: url,
              locations: location ? [location] : undefined,
              status: 'active',
              is_interested: false,
              is_favorite: false,
              source: 'festivalinfo',
              last_updated: new Date(),
              artists: [], // We'll need to scrape individual festival pages for artists
            });
          }
        });
      }
    }

    return festivals;
  }
} 