import type { Festival } from '../../src/types';
import { v4 as uuidv4 } from 'uuid';
import { load } from 'cheerio';
import fetch from 'node-fetch';

export abstract class BaseScraper {
  abstract baseUrl: string;

  protected generateId(): string {
    return uuidv4();
  }

  protected async fetchPage(url: string): Promise<ReturnType<typeof load>> {
    console.log(`Fetching page: ${url}`);
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();
      console.log(`Successfully fetched page: ${url}`);
      console.log('First 1000 characters of HTML:', content.slice(0, 1000));
      return load(content);
    } catch (error) {
      console.error('Error fetching page:', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  protected abstract parseFestivals($: ReturnType<typeof load>): Promise<Festival[]>;

  public async scrape(): Promise<Festival[]> {
    try {
      console.log(`Starting scrape for ${this.constructor.name}`);
      const $ = await this.fetchPage(this.baseUrl);
      const festivals = await this.parseFestivals($);
      console.log(`Found ${festivals.length} festivals from ${this.constructor.name}`);
      return festivals;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in ${this.constructor.name}:`, error.message);
      } else {
        console.error(`Unknown error in ${this.constructor.name}`);
      }
      return [];
    }
  }

  protected parseDutchDate(dateStr: string): Date | undefined {
    // Convert Dutch month names to English
    const dutchToEnglish: { [key: string]: string } = {
      'jan': 'January', 'feb': 'February', 'mrt': 'March', 'apr': 'April',
      'mei': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
      'sep': 'September', 'okt': 'October', 'nov': 'November', 'dec': 'December',
      'januari': 'January', 'februari': 'February', 'maart': 'March', 'april': 'April',
      'juni': 'June', 'juli': 'July', 'augustus': 'August', 'september': 'September',
      'oktober': 'October', 'november': 'November', 'december': 'December'
    };

    try {
      // Remove day names
      dateStr = dateStr.replace(/\b(?:ma|di|wo|do|vr|za|zo|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\b/gi, '');
      
      // Try multiple date formats
      const patterns = [
        // Format: "21-22 juni 2024" or "21-22 juni"
        /(\d{1,2})(?:\s*-\s*\d{1,2})?\s+([a-z]+)(?:\s+(\d{4}))?/i,
        // Format: "21-06-2024"
        /(\d{1,2})-(\d{1,2})-(\d{4})/,
        // Format: "21.06.2024"
        /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
        // Format: "DI 08 APR" (abbreviated day and month)
        /(?:[A-Z]{2}\s+)?(\d{1,2})\s+([A-Z]{3,4})(?:\s+(\d{4}))?/i,
        // Format: "6-11 augustus 2025"
        /\d{1,2}\s*-\s*(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/i
      ];

      for (const pattern of patterns) {
        const match = dateStr.match(pattern);
        if (match) {
          let day, month, year;
          
          if (pattern === patterns[0] || pattern === patterns[3] || pattern === patterns[4]) {
            // Text month format
            day = parseInt(match[1], 10);
            const dutchMonth = match[2].toLowerCase();
            const englishMonth = dutchToEnglish[dutchMonth] || dutchMonth;
            month = new Date(`${englishMonth} 1, 2000`).getMonth();
            year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
          } else {
            // Numeric format
            day = parseInt(match[1], 10);
            month = parseInt(match[2], 10) - 1;
            year = parseInt(match[3], 10);
          }
          
          const date = new Date(year, month, day);
          
          // If the date is in the past and we're in the latter part of the year,
          // assume it's for next year
          if (!match[3] && date < new Date() && new Date().getMonth() > 8) {
            date.setFullYear(year + 1);
          }
          
          // Validate date
          if (!isNaN(date.getTime()) && date >= new Date()) {
            return date;
          }
        }
      }

      console.warn(`Could not parse date: ${dateStr}`);
    } catch (e) {
      if (e instanceof Error) {
        console.error('Error parsing date:', dateStr, e.message);
      } else {
        console.error('Unknown error parsing date:', dateStr);
      }
    }

    return undefined;
  }
} 