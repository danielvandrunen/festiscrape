import { BaseScraper } from './base-scraper';
import { Festival } from '../../types/festival';
import * as puppeteer from 'puppeteer';

export class PartyflockScraper extends BaseScraper {
  name = 'partyflock';
  baseUrl = 'https://partyflock.nl/agenda/festivals';

  private async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async simulateHumanScroll(page: puppeteer.Page): Promise<void> {
    await page.evaluate(async () => {
      const scrollHeight = document.documentElement.scrollHeight;
      let totalHeight = 0;
      const distance = Math.floor(Math.random() * 200) + 100; // Random scroll distance
      
      while (totalHeight <= scrollHeight) {
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        // Random pause between scrolls
        await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200));
        
        // Occasionally scroll up a bit to simulate human behavior
        if (Math.random() < 0.1) {
          window.scrollBy(0, -Math.floor(Math.random() * 100));
          await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
        }
      }
      
      // Scroll back to top
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Scroll to bottom one final time
      window.scrollTo(0, scrollHeight);
    });
  }

  async scrape(): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const processedNames = new Set<string>();

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      const page = await browser.newPage();
      
      // Enhanced browser fingerprinting evasion
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { 
          get: () => [
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
            { name: 'Native Client', filename: 'internal-nacl-plugin' }
          ]
        });
        Object.defineProperty(navigator, 'languages', { get: () => ['nl-NL', 'nl', 'en-US', 'en'] });
        Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
        
        // Mock WebGL
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445) return 'Intel Inc.';
          if (parameter === 37446) return 'Intel(R) Iris(TM) Graphics 6100';
          return getParameter.apply(this, [parameter]);
        };
      });

      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'sec-ch-ua': '"Chromium";v="122", "Google Chrome";v="122", "Not(A:Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"'
      });

      console.log('Navigating to Partyflock...');
      await page.goto(this.baseUrl, { waitUntil: 'networkidle0', timeout: 60000 });

      // Handle cookie consent
      try {
        await page.waitForSelector('[id*="cookie"], [class*="cookie"], [id*="consent"], [class*="consent"]', { timeout: 5000 });
        await this.randomDelay(500, 1500);
        await page.click('[id*="cookie"], [class*="cookie"], [id*="consent"], [class*="consent"]');
        console.log('Accepted cookies');
        await this.randomDelay(1000, 2000);
      } catch (e) {
        console.log('No cookie consent button found');
      }

      // Simulate human-like scrolling
      console.log('Scrolling through content...');
      await this.simulateHumanScroll(page);
      await this.randomDelay(2000, 3000);

      // Extract festivals with enhanced selectors
      console.log('Extracting festival data...');
      const festivalData = await page.evaluate(() => {
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

        const datePatterns = [
          /(\d{1,2})[-\s]+([a-z]+)[-\s]+(\d{4})/i,
          /(\d{1,2})[-\s]+([a-z]+)/i,
          /([a-z]+)[-\s]+(\d{1,2})[-\s]+(\d{4})/i
        ];

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

        let items: Element[] = [];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            items = [...items, ...Array.from(elements)];
          }
        }

        return items.map(item => {
          try {
            // Enhanced name extraction
            const nameSelectors = [
              'h3.title', '.event-name', '.title', 
              'h2', 'h3', 'h4', '[class*="title"]', 
              '[class*="name"]', 'a[href*="festival"]'
            ];
            let name = '';
            for (const sel of nameSelectors) {
              const el = item.querySelector(sel);
              if (el) {
                name = el.textContent?.trim() || '';
                if (name) break;
              }
            }

            // Enhanced date extraction
            const dateSelectors = [
              'time', '.event-date', '.date', 
              '[class*="date"]', '[class*="time"]',
              '[datetime]'
            ];
            let dateStr = '';
            let dateTime = '';
            for (const sel of dateSelectors) {
              const el = item.querySelector(sel);
              if (el) {
                dateTime = (el as HTMLTimeElement).getAttribute('datetime') || '';
                dateStr = el.textContent?.trim() || '';
                if (dateStr || dateTime) break;
              }
            }

            // Enhanced location extraction
            const locationSelectors = [
              '.location', '.venue', 
              '[class*="location"]', '[class*="venue"]',
              '[class*="place"]', '.event-venue'
            ];
            let location = '';
            for (const sel of locationSelectors) {
              const el = item.querySelector(sel);
              if (el) {
                location = el.textContent?.trim() || '';
                if (location) break;
              }
            }

            // Enhanced URL extraction
            const urlSelectors = [
              'a.link', 'a[href*="festival"]', 
              'a[href*="event"]', 'a.title-link', 
              'h3 a', 'h2 a'
            ];
            let url = '';
            for (const sel of urlSelectors) {
              const el = item.querySelector(sel);
              if (el) {
                url = (el as HTMLAnchorElement).href || '';
                if (url) break;
              }
            }

            if (!name || !url) return null;

            // Parse date
            let date = dateTime ? new Date(dateTime) : null;
            if (!date || isNaN(date.getTime())) {
              for (const pattern of datePatterns) {
                const match = dateStr.toLowerCase().match(pattern);
                if (match) {
                  const day = parseInt(match[1]);
                  const monthStr = match[2].toLowerCase();
                  const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
                  const month = monthMap[monthStr];
                  
                  if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                    date = new Date(year, month, day);
                    break;
                  }
                }
              }
            }

            if (!date || isNaN(date.getTime())) return null;

            return { name, date: date.toISOString(), location, url };
          } catch (error) {
            console.error('Error parsing festival item:', error);
            return null;
          }
        }).filter((item): item is NonNullable<typeof item> => item !== null);
      });

      console.log(`Found ${festivalData.length} potential festivals`);

      // Process festival data
      for (const data of festivalData) {
        const normalizedName = data.name.toLowerCase().replace(/[^\w\s-]/g, '').trim();
        
        // Skip if already processed or invalid
        if (!normalizedName || processedNames.has(normalizedName)) {
          continue;
        }

        const date = new Date(data.date);
        
        // Skip past festivals
        if (date < new Date()) {
          continue;
        }

        const festival: Festival = {
          id: `partyflock-${normalizedName.replace(/\s+/g, '-')}`,
          name: data.name,
          date,
          website: data.url.startsWith('http') ? data.url : `https://partyflock.nl${data.url}`,
          locations: data.location ? [data.location] : undefined,
          status: 'active',
          is_interested: false,
          is_favorite: false,
          source: 'partyflock',
          last_updated: new Date(),
          artists: []
        };

        processedNames.add(normalizedName);
        festivals.push(festival);
      }

      await browser.close();
    } catch (error) {
      console.error('Error scraping Partyflock:', error);
    }

    console.log(`Found ${festivals.length} unique festivals from Partyflock`);
    return festivals;
  }
} 