import { BaseScraper } from './base-scraper';
import { Festival } from '../../types/festival';
import * as cheerio from 'cheerio';

export class EBLiveScraper extends BaseScraper {
  name = 'eblive';
  baseUrl = 'https://entertainmentbusiness.nl/festivals/';

  async scrape(): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const pages = await this.fetchAllPages(this.baseUrl, '.pagination a:contains("Volgende")');

    for (const html of pages) {
      const $ = cheerio.load(html);
      
      // Look for festival items in h5 elements
      $('h5').each((_, element) => {
        const $el = $(element);
        
        // Get the festival name from the heading
        const name = $el.text()
          .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
          .replace(/^(?:festival|event):\s*/i, '')  // Remove "Festival:" or "Event:" prefix
          .replace(/\s+\d+$/, '') // Remove year from name if present
          .replace(/Editie #\d+/, '') // Remove "Editie #X" prefix
          .trim();
        
        // Skip if name is too short or contains navigation text
        if (name.length < 3 || /menu|login|register|inloggen|registreren|zoeken|gevonden/i.test(name)) {
          return;
        }

        // Get the parent container for location and date
        const $container = $el.parent();
        const containerText = $container.text().trim();
        const lines = containerText.split('\n').map(line => line.trim()).filter(Boolean);

        // Extract location and date
        let location = '';
        let dateStr = '';

        for (const line of lines) {
          if (line.includes('(NL)') || line.includes('(BE)') || line.includes('(AT)') || line.includes('(FR)') || line.includes('(ES)')) {
            location = line.replace(/\([A-Z]{2}\)/, '').trim();
          } else if (line.includes('t/m') || line.match(/\b(?:ma|di|wo|do|vr|za|zo)\b/i)) {
            dateStr = line.trim();
          }
        }

        // Parse the Dutch date format
        const date = this.parseDutchDate(dateStr) || new Date();

        // Get the link
        const $link = $container.find('a').first();
        const relativeUrl = $link.attr('href');
        const url = relativeUrl ? new URL(relativeUrl, this.baseUrl).toString() : undefined;

        if (name && url && !festivals.some(f => f.name === name)) {
          festivals.push({
            id: `eblive-${name.toLowerCase().replace(/\s+/g, '-')}`,
            name,
            date,
            website: url,
            locations: location ? [location] : undefined,
            status: 'active',
            is_interested: false,
            is_favorite: false,
            source: 'eblive',
            last_updated: new Date(),
            artists: [], // We'll need to scrape individual festival pages for artists
          });
        }
      });
    }

    return festivals;
  }
}