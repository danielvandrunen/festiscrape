import type { Festival } from '../../src/types';
import { BaseScraper } from './base-scraper.js';
import type { CheerioAPI } from 'cheerio';

export class FestileaksScraper extends BaseScraper {
  baseUrl = 'https://festileaks.nl/festivals/';

  protected async parseFestivals($: CheerioAPI): Promise<Festival[]> {
    const festivals: Festival[] = [];

    $('.festival-item').each((index, element) => {
      const name = $(element).find('.festival-title').text().trim();
      const dateText = $(element).find('.festival-date').text().trim();
      const location = $(element).find('.festival-location').text().trim();
      const website = $(element).find('a').attr('href') || '';

      // Use the base scraper's parseDutchDate method for consistent date parsing
      const date = this.parseDutchDate(dateText);
      
      if (!date) {
        console.warn(`Could not parse date for ${name}: '${dateText}'`);
        return;
      }

      festivals.push({
        id: this.generateId(),
        name,
        date,
        website,
        locations: [location],
        source: 'festileaks',
        status: 'active',
        is_interested: false,
        last_updated: new Date()
      });
    });

    return festivals;
  }
} 