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
      'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
      'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
    };

    $('.festival').each((_, element) => {
      try {
        const name = $(element).find('.festival-name a').text().trim();
        const dateText = $(element).find('.festival-date span').text().trim();
        const location = $(element).find('.festival-location span').text().trim();
        const website = $(element).find('.festival-name a').attr('href') || '';

        // Parse date text (format: "Za 19 apr t/m zo 20 apr" or "Zondag 20 april")
        const dateMatch = dateText.match(/(\d{1,2})(?:\s*-\s*\d{1,2})?\s+([a-z]+)(?:\s+(\d{4}))?/i);
        
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const monthStr = dateMatch[2].toLowerCase();
          const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
          const month = monthMap[monthStr];

          if (month !== undefined) {
            const date = new Date(year, month, day);
            
            // Only add future festivals
            if (date >= new Date()) {
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
            }
          }
        }
      } catch (error) {
        console.error('Error parsing festival:', error);
      }
    });

    return festivals;
  }
}