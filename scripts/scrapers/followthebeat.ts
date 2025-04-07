import { Festival } from '../../src/types';
import { BaseScraper } from './base-scraper.js';
import type { CheerioAPI } from 'cheerio';

export class FollowTheBeatScraper extends BaseScraper {
  public baseUrl = 'https://followthebeat.nl/agenda/?festival=';

  protected async parseFestivals($: CheerioAPI): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const now = new Date();

    // Find all festival cards
    $('.swiper-slide').each((_, element) => {
      try {
        const $element = $(element);
        const name = $element.find('h3').text().trim();
        const dateText = $element.find('time').text().trim();
        const location = $element.find('.comma-seperate span').text().trim();
        const website = $element.attr('href');

        // Parse date from format like "ma 05 mei 2025" or "vr 05 mei 2023"
        const dateParts = dateText.split(' ');
        if (dateParts.length < 4) return;

        const day = parseInt(dateParts[1]);
        const monthMap: { [key: string]: number } = {
          'jan': 0, 'feb': 1, 'mrt': 2, 'apr': 3, 'mei': 4, 'jun': 5,
          'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11
        };
        const month = monthMap[dateParts[2].toLowerCase()];
        const year = parseInt(dateParts[3]);

        if (isNaN(day) || month === undefined || isNaN(year)) return;

        const date = new Date(year, month, day);
        
        // Skip past festivals
        if (date < now) return;

        festivals.push({
          id: this.generateId(),
          name,
          date,
          website: website || '',
          locations: location ? [location] : [],
          source: 'followthebeat',
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