import { Festival } from '../../types/festival';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export abstract class BaseScraper {
  abstract name: string;
  abstract baseUrl: string;
  abstract scrape(): Promise<Festival[]>;

  protected async fetchPage(url: string, retries = 3): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set a reasonable timeout
      page.setDefaultNavigationTimeout(30000);
      
      // Enable request interception to block unnecessary resources
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          await page.goto(url, { waitUntil: 'networkidle0' });
          return await page.content();
        } catch (error) {
          lastError = error;
          console.warn(`Attempt ${i + 1} failed for ${url}:`, error.message);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
          }
        }
      }
      throw lastError;
    } finally {
      await browser.close();
    }
  }

  protected async fetchAllPages(baseUrl: string, nextSelector: string): Promise<string[]> {
    const pages: string[] = [];
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      let currentUrl = baseUrl;
      let pageCount = 0;
      const maxPages = 100; // Safety limit
      
      while (currentUrl && pageCount < maxPages) {
        console.log(`Fetching page ${pageCount + 1}: ${currentUrl}`);
        
        await page.goto(currentUrl, { waitUntil: 'networkidle0' });
        pages.push(await page.content());
        
        // Find next page link
        const nextUrl = await page.evaluate((selector) => {
          const nextLink = document.querySelector(selector);
          return nextLink ? nextLink.getAttribute('href') : null;
        }, nextSelector);
        
        if (!nextUrl) break;
        currentUrl = new URL(nextUrl, baseUrl).toString();
        pageCount++;
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      await browser.close();
    }
    
    return pages;
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

  protected validateFestival(festival: Festival): boolean {
    if (!festival.name || festival.name.length < 3) return false;
    if (!festival.date || isNaN(festival.date.getTime())) return false;
    if (festival.date < new Date()) return false;
    if (!festival.website) return false;
    return true;
  }
} 