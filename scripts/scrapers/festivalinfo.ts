import type { Festival } from '../../src/types';
import { BaseScraper } from './base-scraper.js';
import type { CheerioAPI } from 'cheerio';

export class FestivalInfoScraper extends BaseScraper {
  baseUrl = 'https://www.festivalinfo.nl/festivals/';

  protected async parseFestivals($: CheerioAPI): Promise<Festival[]> {
    const festivals: Festival[] = [];
    console.log('Parsing FestivalInfo page...');

    const yearMatch = $.html().match(/\b(202\d)\b/);
    const currentYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

    $('.festival_rows_info').each((index, element) => {
      try {
        const $element = $(element);
        const name = $element.find('strong a').text().trim();
        const website = $element.find('strong a').attr('href') || '';
        const location = $element.find('.eightcol span').first().text().replace(/,.*$/, '').trim();

        // Broader selector for date section
        const dateSection = $element.prevAll('.festival_agenda_date').first();
        const dateText = dateSection.text().trim().replace(/\s+/g, ' '); // Get all text and normalize spaces

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
          website: website.startsWith('http') ? website : `https://www.festivalinfo.nl${website}`,
          locations: location ? [location] : [],
          source: 'festivalinfo',
          status: 'active',
          is_interested: false,
          last_updated: new Date()
        });
        // console.log('Successfully added festival:', name);
      } catch (error) {
        console.error(`Error parsing FestivalInfo entry for ${$(element).find('strong a').text().trim()}:`, error);
      }
    });

    return festivals;
  }
} 