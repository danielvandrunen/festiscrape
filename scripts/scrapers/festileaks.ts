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

      // Parse date (example format: "21 - 23 juni 2024")
      const dateMatch = dateText.match(/(\d+)(?:\s*-\s*\d+)?\s+([a-zA-Z]+)\s+(\d{4})/);
      if (!dateMatch) return;

      const [, day, month, year] = dateMatch;
      const dutchMonths: { [key: string]: number } = {
        'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
        'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
      };

      const monthIndex = dutchMonths[month.toLowerCase()];
      if (monthIndex === undefined) return;

      const date = new Date(parseInt(year), monthIndex, parseInt(day));
      if (isNaN(date.getTime()) || date < new Date()) return;

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