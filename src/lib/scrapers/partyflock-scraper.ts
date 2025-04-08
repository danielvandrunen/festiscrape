import { BaseScraper } from './base-scraper';
import { Festival } from '../../types/festival';
import axios, { AxiosError } from 'axios';
import cheerio from 'cheerio';

export class PartyflockScraper extends BaseScraper {
  name = 'partyflock';
  baseUrl = 'https://partyflock.nl/agenda/festivals';
  private maxRetries = 3;
  private retryDelay = 5000;

  private async randomDelay(min: number = 2000, max: number = 5000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private parseDate(dateStr: string): Date {
    // Try parsing ISO date string
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Define month mappings for Dutch month names
    const monthMap: { [key: string]: number } = {
      'jan': 0, 'januari': 0,
      'feb': 1, 'februari': 1,
      'mrt': 2, 'maart': 2,
      'apr': 3, 'april': 3,
      'mei': 4,
      'jun': 5, 'juni': 5,
      'jul': 6, 'juli': 6,
      'aug': 7, 'augustus': 7,
      'sep': 8, 'september': 8,
      'okt': 9, 'oktober': 9,
      'nov': 10, 'november': 10,
      'dec': 11, 'december': 11
    };

    // Try parsing Dutch date formats
    const patterns = [
      /(\d{1,2})[-\s]+([a-z]+)[-\s]+(\d{4})/i,
      /(\d{1,2})[-\s]+([a-z]+)/i,
      /([a-z]+)[-\s]+(\d{1,2})[-\s]+(\d{4})/i
    ];

    for (const pattern of patterns) {
      const match = dateStr.toLowerCase().match(pattern);
      if (match) {
        let day: number, month: number, year: number;

        if (match[1] && monthMap[match[2]]) {
          // Format: DD Month YYYY
          day = parseInt(match[1]);
          month = monthMap[match[2]];
          year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        } else if (match[2] && monthMap[match[1]]) {
          // Format: Month DD YYYY
          day = parseInt(match[2]);
          month = monthMap[match[1]];
          year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        } else {
          continue;
        }

        if (!isNaN(day) && !isNaN(year)) {
          const parsedDate = new Date(year, month, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
    }

    // If all parsing attempts fail, return current date
    console.warn(`Could not parse date string: ${dateStr}, using current date`);
    return new Date();
  }

  private async fetchWithRetry(url: string, retries = 0): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Upgrade-Insecure-Requests': '1',
          'sec-ch-ua': '"Chromium";v="122", "Google Chrome";v="122", "Not(A:Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"'
        },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && retries < this.maxRetries) {
        console.log(`Retry ${retries + 1}/${this.maxRetries} after error:`, error.message);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, retries + 1);
      }
      throw error;
    }
  }

  private parseFestival($: cheerio.CheerioAPI, element: cheerio.Node): Festival | null {
    try {
      // Extract name
      const nameSelectors = [
        'h3.title', '.event-name', '.title',
        'h2', 'h3', 'h4', '[class*="title"]',
        '[class*="name"]', 'a[href*="festival"]'
      ];
      let name = '';
      for (const sel of nameSelectors) {
        const el = $(element).find(sel).first();
        if (el.length) {
          name = el.text().trim();
          if (name) break;
        }
      }

      // Extract date
      const dateSelectors = [
        'time', '.event-date', '.date',
        '[class*="date"]', '[class*="time"]',
        '[datetime]'
      ];
      let dateStr = '';
      for (const sel of dateSelectors) {
        const el = $(element).find(sel).first();
        if (el.length) {
          dateStr = el.attr('datetime') || el.text().trim();
          if (dateStr) break;
        }
      }

      // Extract location
      const locationSelectors = [
        '.location', '[class*="location"]',
        '.venue', '[class*="venue"]',
        '.place', '[class*="place"]'
      ];
      let location = '';
      for (const sel of locationSelectors) {
        const el = $(element).find(sel).first();
        if (el.length) {
          location = el.text().trim();
          if (location) break;
        }
      }

      // Extract website
      const websiteSelectors = [
        'a[href*="festival"]',
        'a[href*="event"]',
        'a[href*="party"]',
        '.title a',
        'h3 a'
      ];
      let website = '';
      for (const sel of websiteSelectors) {
        const el = $(element).find(sel).first();
        if (el.length) {
          website = el.attr('href') || '';
          if (website) break;
        }
      }

      if (!name || !dateStr) {
        return null;
      }

      console.log('Parsing event:', { name, dateStr, location, website });
      
      return {
        id: '', // This will be set by Supabase
        name,
        date: this.parseDate(dateStr),
        locations: location ? [location] : undefined,
        website: website ? `https://partyflock.nl${website}` : undefined,
        source: 'partyflock',
        status: 'active',
        is_interested: false,
        is_favorite: false,
        artists: [],
        last_updated: new Date()
      };
    } catch (error) {
      console.error('Error parsing festival element:', error);
      return null;
    }
  }

  async scrape(): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const processedNames = new Set<string>();

    try {
      console.log('Fetching Partyflock festivals page...');
      const html = await this.fetchWithRetry(this.baseUrl);
      const $ = cheerio.load(html);

      // Define selectors for festival elements
      const selectors = [
        'article.agenda-item',
        '.event-list .event-item',
        '.festival-list .festival-item',
        '[class*="festival-list"] [class*="festival-item"]',
        '[class*="event-list"] [class*="event-item"]',
        '.agenda-items > div',
        '.event-container',
        '[data-event-type="festival"]'
      ];

      // Process each festival element
      for (const selector of selectors) {
        const elements = $(selector).toArray();
        for (const element of elements) {
          await this.randomDelay(); // Rate limiting
          const festival = this.parseFestival($, element);
          
          if (festival && !processedNames.has(festival.name)) {
            processedNames.add(festival.name);
            festivals.push(festival);
          }
        }
      }

      console.log(`Found ${festivals.length} unique festivals from Partyflock`);
      return festivals;
    } catch (error) {
      console.error('Error in PartyflockScraper:', error);
      throw error;
    }
  }
} 