import { Festival } from '../../src/types';
import { BaseScraper } from './base-scraper.js';
import type { CheerioAPI } from 'cheerio';

export class EBLiveScraper extends BaseScraper {
  public baseUrl = 'https://www.eblive.nl/festivals/';

  protected async parseFestivals($: CheerioAPI): Promise<Festival[]> {
    const festivals: Festival[] = [];
    console.log('Parsing festivals from EBLive...');

    // Dutch month names to numbers mapping
    const monthMap: { [key: string]: number } = {
      'januari': 0, 'jan': 0,
      'februari': 1, 'feb': 1,
      'maart': 2, 'mrt': 2,
      'april': 3, 'apr': 3,
      'mei': 4,
      'juni': 5, 'jun': 5,
      'juli': 6, 'jul': 6,
      'augustus': 7, 'aug': 7,
      'september': 8, 'sep': 8,
      'oktober': 9, 'okt': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11
    };

    $('.festival').each((_, element) => {
      try {
        const name = $(element).find('.festival-name a').text().trim();
        const dateText = $(element).find('.festival-date span').text().trim();
        const location = $(element).find('.festival-location span').text().trim();
        const website = $(element).find('.festival-name a').attr('href') || '';

        // Use the base scraper's parseDutchDate method for consistent date parsing
        const date = this.parseDutchDate(dateText);
        
        if (!date) {
          console.warn(`Could not parse date for ${name}: '${dateText}'`);
          return;
        }
        
        console.log(`Found festival: ${name} on ${date.toISOString()}`);
        festivals.push({
          id: this.generateId(),
          name,
          date,
          website,
          locations: [location],
          source: 'eblive',
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