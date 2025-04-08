import { BaseScraper } from './base-scraper';
import { Festival } from '../../types/festival';
import * as cheerio from 'cheerio';

export class FestivalInfoScraper extends BaseScraper {
  name = 'festivalinfo';
  baseUrl = 'https://www.festivalinfo.nl/festivals/';

  private normalizeFestivalName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/^(?:festival|event):\s*/i, '')
      .replace(/\s+\d+$/, '')
      .replace(/[^\w\s-]/g, '')
      .trim();
  }

  async scrape(): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const processedNames = new Set<string>(); // Track processed festival names to avoid duplicates
    const pages = await this.fetchAllPages(this.baseUrl, '.pagination .next');

    for (const html of pages) {
      const $ = cheerio.load(html);
      
      // First try to find schema.org festival data
      $('script[type="application/ld+json"]').each((_, element) => {
        try {
          const data = JSON.parse($(element).html() || '');
          if (data['@type'] === 'Festival') {
            const rawName = data.name.replace(/\s+\d+$/, ''); // Remove year from name if present
            const normalizedName = this.normalizeFestivalName(rawName);
            
            // Skip if we've already processed this festival
            if (processedNames.has(normalizedName)) {
              return;
            }
            
            const url = data.url;
            const date = data.startDate ? new Date(data.startDate) : undefined;
            const location = data.location?.address?.addressLocality || '';

            if (rawName && url && date && !isNaN(date.getTime()) && date >= new Date()) {
              processedNames.add(normalizedName);
              festivals.push({
                id: `festivalinfo-${normalizedName.replace(/\s+/g, '-')}`,
                name: rawName,
                date,
                website: url,
                locations: location ? [location] : undefined,
                status: 'active',
                is_interested: false,
                is_favorite: false,
                source: 'festivalinfo',
                last_updated: new Date(),
                artists: []
              });
            }
          }
        } catch (e) {
          console.error('Error parsing schema.org data:', e);
        }
      });

      // Try regular HTML parsing
      $('.festival-item, [class*="festival-list"], [class*="event-list"], tr[id^="festival"]').each((_, element) => {
        const $el = $(element);
        
        // Get the festival name from the title or heading
        const rawName = $el.find('h1, h2, h3, h4, .title, [class*="title"], [class*="name"], a').first().text()
          .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
          .replace(/^(?:festival|event):\s*/i, '')  // Remove "Festival:" or "Event:" prefix
          .replace(/\s+\d+$/, '') // Remove year from name if present
          .trim();
        
        const normalizedName = this.normalizeFestivalName(rawName);
        
        // Skip if name is too short, contains navigation text, or already processed
        if (normalizedName.length < 3 || 
            /menu|login|register|inloggen|registreren|zoeken/i.test(normalizedName) ||
            processedNames.has(normalizedName)) {
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
          // Try to find a date pattern in the text
          const dateMatch = text.match(/\b(\d{1,2})[-\s]+([a-z]+)(?:[-\s]+(\d{4}))?\b/i);
          if (dateMatch) {
            date = this.parseDutchDate(`${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3] || new Date().getFullYear()}`);
          }
        }

        // Try to extract location from specific elements or full text
        let location = locationText;
        if (!location) {
          const locationMatch = text.match(/(?:in|te|at)\s+([^,\.]+)/i) || text.match(/, ([^,\.]+)$/);
          location = locationMatch ? locationMatch[1].trim() : '';
        }

        if (rawName && url && date && !isNaN(date.getTime()) && date >= new Date()) {
          processedNames.add(normalizedName);
          festivals.push({
            id: `festivalinfo-${normalizedName.replace(/\s+/g, '-')}`,
            name: rawName,
            date,
            website: url,
            locations: location ? [location] : undefined,
            status: 'active',
            is_interested: false,
            is_favorite: false,
            source: 'festivalinfo',
            last_updated: new Date(),
            artists: []
          });
        }
      });
    }

    console.log(`Found ${festivals.length} unique festivals from FestivalInfo`);
    return festivals;
  }
} 