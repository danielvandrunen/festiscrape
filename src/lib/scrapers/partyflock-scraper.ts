import { Festival } from '../../types/festival';
import { BaseScraper } from './base-scraper';
import cheerio from 'cheerio';

export class PartyflockScraper extends BaseScraper {
  name = 'Partyflock';
  baseUrl = 'https://partyflock.nl/agenda/festivals';

  protected async parseFestivals($: cheerio.Root): Promise<Festival[]> {
    const festivals: Festival[] = [];
    const festivalEntries = $('tbody.hl');

    console.log(`Found ${festivalEntries.length} festival entries`);

    festivalEntries.each((_: number, entry: cheerio.Element) => {
      try {
        const $entry = $(entry);
        
        // Get festival name
        const name = $entry.find('span[itemprop="name"]').text().trim() || 'Unknown';
        
        // Get date
        const dateMeta = $entry.find('meta[itemprop="startDate"]');
        const dateStr = dateMeta.attr('content');
        const date = dateStr ? new Date(dateStr) : new Date();
        
        // Get location
        const location = $entry.find('a[href*="/location/"]').text().trim() || 'Unknown';
        
        // Get city
        const city = $entry.find('span.nowrap.light7 a').text().trim() || 'Unknown';
        
        // Get country (default to Netherlands since it's partyflock.nl)
        const country = 'Netherlands';

        // Create festival object
        const festival: Festival = {
          id: `${name}-${date.toISOString()}-${location}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name,
          date,
          website: `https://partyflock.nl${$entry.find('a[href*="/event/"]').attr('href')}`,
          locations: [`${location}, ${city}, ${country}`],
          source: 'partyflock',
          status: 'active',
          is_interested: false,
          is_favorite: false,
          artists: [],
          last_updated: new Date()
        };

        festivals.push(festival);
      } catch (error) {
        console.error('Error processing festival entry:', error);
      }
    });

    return festivals;
  }

  public async scrape(): Promise<Festival[]> {
    try {
      console.log('Starting Partyflock scraper...');
      const html = await this.fetchPage(this.baseUrl);
      const $ = cheerio.load(html);
      return await this.parseFestivals($);
    } catch (error) {
      console.error('Error in Partyflock scraper:', error);
      return [];
    }
  }
} 