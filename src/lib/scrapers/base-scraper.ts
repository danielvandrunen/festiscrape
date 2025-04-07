import { Festival } from '../../types/festival';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export abstract class BaseScraper {
  abstract name: string;
  abstract baseUrl: string;

  abstract scrape(): Promise<Festival[]>;

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

      // Extract day and month
      const dateMatch = dateStr.match(/(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/i);
      if (dateMatch) {
        const day = parseInt(dateMatch[1], 10);
        const dutchMonth = dateMatch[2].toLowerCase();
        const englishMonth = dutchToEnglish[dutchMonth] || dutchMonth;
        const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : new Date().getFullYear();
        
        // Construct date string
        const dateString = `${day} ${englishMonth} ${year}`;
        const date = new Date(dateString);
        
        // Validate date
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    } catch (e) {
      // Ignore date parse errors
    }

    return undefined;
  }

  protected async fetchPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
    });
    try {
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(60000); // Increase timeout to 60 seconds
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      // Wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 10000)); // Increase wait time to 10 seconds
      
      // Click any cookie consent buttons
      try {
        await page.click('button[id*="cookie"], button[class*="cookie"], button[id*="consent"], button[class*="consent"]');
      } catch (e) {
        // Ignore if no cookie button found
      }

      // Wait for any cookie consent dialogs to disappear
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Scroll to bottom to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const maxScrolls = 50; // Limit the number of scrolls to avoid infinite loops
          let scrollCount = 0;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            scrollCount++;
            
            if(totalHeight >= scrollHeight || scrollCount >= maxScrolls){
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
      
      // Wait for any lazy-loaded content
      await new Promise(resolve => setTimeout(resolve, 5000)); // Increase wait time to 5 seconds
      
      const html = await page.content();
      console.log(`HTML length: ${html.length}`);
      console.log('First 500 characters:', html.substring(0, 500));
      return html;
    } finally {
      await browser.close();
    }
  }

  protected async fetchAllPages(baseUrl: string, nextPageSelector: string): Promise<string[]> {
    const pages: string[] = [];
    let currentUrl = baseUrl;
    let hasNextPage = true;
    let pageCount = 0;
    const maxPages = 10; // Limit the number of pages to avoid infinite loops

    while (hasNextPage && pageCount < maxPages) {
      const html = await this.fetchPage(currentUrl);
      pages.push(html);
      pageCount++;

      const $ = cheerio.load(html);
      const nextPageLink = $(nextPageSelector).attr('href');
      
      if (nextPageLink) {
        currentUrl = new URL(nextPageLink, baseUrl).toString();
      } else {
        hasNextPage = false;
      }
    }

    return pages;
  }
} 