import type { Festival } from '../../src/types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

export abstract class BaseScraper {
  abstract baseUrl: string;

  protected generateId(): string {
    return uuidv4();
  }

  protected async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    console.log(`Fetching page: ${url}`);
    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });
      console.log(`Successfully fetched page: ${url}`);
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching page ${url}:`, error.message);
      throw error;
    }
  }

  protected abstract parseFestivals($: cheerio.CheerioAPI): Promise<Festival[]>;

  public async scrape(): Promise<Festival[]> {
    try {
      console.log(`Starting scrape for ${this.constructor.name}`);
      const $ = await this.fetchPage(this.baseUrl);
      const festivals = await this.parseFestivals($);
      console.log(`Found ${festivals.length} festivals from ${this.constructor.name}`);
      
      // Add metadata to each festival
      return festivals.map(festival => ({
        ...festival,
        last_updated: new Date(),
        status: 'active',
        is_interested: false
      }));
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error.message);
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
      
      // Handle date ranges (take the first date)
      dateStr = dateStr.split(/\s*(?:t\/m|-)\s*/)[0];

      // Try multiple date formats
      const patterns = [
        // Format: "21 juni 2024" or "21 juni"
        /(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/i,
        // Format: "21-06-2024"
        /(\d{1,2})-(\d{1,2})-(\d{4})/,
        // Format: "21.06.2024"
        /(\d{1,2})\.(\d{1,2})\.(\d{4})/
      ];

      for (const pattern of patterns) {
        const match = dateStr.match(pattern);
        if (match) {
          let day, month, year;
          
          if (pattern === patterns[0]) {
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
          
          // Validate date
          if (!isNaN(date.getTime()) && date >= new Date()) {
            return date;
          }
        }
      }
    } catch (e) {
      console.error('Error parsing date:', dateStr, e);
    }

    return undefined;
  }
} 