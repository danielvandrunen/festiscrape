import type { Festival } from '../../src/types';
import { BaseScraper } from './base-scraper.js';
import type { CheerioAPI } from 'cheerio';

export class FestivalInfoScraper extends BaseScraper {
  baseUrl = 'https://www.festivalinfo.nl/festivals/';

  protected async parseFestivals($: CheerioAPI): Promise<Festival[]> {
    const festivals: Festival[] = [];
    console.log('Parsing FestivalInfo page...');

    $('.festival_rows_info').each((index, element) => {
      const name = $(element).find('strong a').text().trim();
      const dateSection = $(element).prevAll('.festival_agenda_date').first();
      const day = dateSection.find('.festival_dag').text().trim();
      const month = dateSection.find('span').last().text().trim();
      const location = $(element).find('.eightcol span').first().text().replace(/,.*$/, '').trim();
      const website = $(element).find('strong a').attr('href') || '';

      // Get the year from any element on the page containing a year
      const yearMatch = $.html().match(/\b(202\d)\b/);
      const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

      // Parse date
      const dutchMonths: { [key: string]: number } = {
        'JAN': 0, 'FEB': 1, 'MRT': 2, 'APR': 3, 'MEI': 4, 'JUN': 5,
        'JUL': 6, 'AUG': 7, 'SEP': 8, 'OKT': 9, 'NOV': 10, 'DEC': 11
      };

      const monthIndex = dutchMonths[month.toUpperCase()];
      if (monthIndex === undefined || !day) {
        console.log('Could not parse date:', { day, month, year });
        return;
      }

      const date = new Date(parseInt(year), monthIndex, parseInt(day));
      if (isNaN(date.getTime()) || date < new Date()) {
        console.log('Invalid or past date:', date);
        return;
      }

      festivals.push({
        id: this.generateId(),
        name,
        date,
        website: website.startsWith('http') ? website : `https://www.festivalinfo.nl${website}`,
        locations: [location],
        source: 'festivalinfo',
        status: 'active',
        is_interested: false,
        last_updated: new Date()
      });
      console.log('Successfully added festival:', name);
    });

    return festivals;
  }
} 