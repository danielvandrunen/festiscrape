import puppeteer from 'puppeteer';
import { Festival, Artist } from '../types/festival';

export async function scrapeFestivalLineup(url: string): Promise<Festival> {
  const browser = await puppeteer.launch({
    headless: 'new',
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // This is a basic example - you'll need to customize the selectors
    // based on the specific festival website structure
    const festivalName = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    
    const artists: Artist[] = await page.$$eval('.artist-item', (elements) => {
      return elements.map((el) => ({
        name: el.querySelector('.artist-name')?.textContent?.trim() || '',
        day: el.querySelector('.day')?.textContent?.trim(),
        stage: el.querySelector('.stage')?.textContent?.trim(),
        time: el.querySelector('.time')?.textContent?.trim(),
      }));
    });

    return {
      name: festivalName,
      url,
      artists,
    };
  } finally {
    await browser.close();
  }
} 