import { Festival } from '@/types';
import { BaseScraper } from './base-scraper';
import type { CheerioAPI } from 'cheerio';

export class PartyflockScraper extends BaseScraper {
  baseUrl = 'https://partyflock.nl/agenda/festivals';

  public async parseFestivals($: CheerioAPI): Promise<Festival[]> {
    const festivals: Festival[] = [];

    // Look for festival elements - they might be in different structures
    // First try the schema.org Event type
    const events = $('[itemtype="https://schema.org/Event"]');
    console.log(`Found ${events.length} elements with schema.org Event type`);

    if (events.length === 0) {
      // Try alternative selectors if schema.org elements aren't found
      const festivalElements = $('.festival-item, .event-item, .agenda-item, [class*="festival"], [class*="event"]');
      console.log(`Found ${festivalElements.length} elements with festival/event related classes`);
      
      festivalElements.each((_, element) => {
        try {
          const $element = $(element);
          
          // Try to find the name in various ways
          let name = $element.find('[itemprop="name"], .name, .title, h2, h3').first().text().trim();
          
          // Try to find the date
          let dateStr = $element.find('[itemprop="startDate"], .date, .datum, time').first().text().trim();
          let date = dateStr ? this.parseDutchDate(dateStr) : undefined;
          
          // Try to find the location
          let location = $element.find('[itemprop="addressLocality"], .location, .locatie').first().text().trim();
          
          // Try to find the website
          let website = $element.find('a').first().attr('href');
          
          console.log('Parsing event:', { name, dateStr, location, website });
          
          if (name && date && !isNaN(date.getTime())) {
            festivals.push({
              id: this.generateId(),
              name,
              date,
              website: website ? new URL(website, this.baseUrl).toString() : undefined,
              locations: location ? [location] : [],
              source: 'partyflock',
              status: 'active',
              is_interested: false,
              last_updated: new Date()
            });
          } else {
            console.log('Skipping event due to missing or invalid data:', { name, date });
          }
        } catch (error) {
          console.warn(`Failed to parse festival event: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
    } else {
      // Process schema.org Event elements
      events.each((_, event) => {
        try {
          const $event = $(event);
          
          // Extract date from meta tag or text content
          const dateStr = $event.find('meta[itemprop="startDate"]').attr('content') || 
                          $event.find('[itemprop="startDate"]').text().trim();
          const date = dateStr ? new Date(dateStr) : undefined;
          
          // Extract name from various possible locations
          const name = $event.find('span[itemprop="name"], [itemprop="name"]').first().text().trim() ||
                      $event.find('h2, h3, .name, .title').first().text().trim();
          
          // Extract location from meta tag or text content
          const location = $event.find('meta[itemprop="addressLocality"]').attr('content') ||
                          $event.find('[itemprop="addressLocality"]').text().trim();
          
          // Extract website URL
          const website = $event.find('a[itemprop="url"], a').first().attr('href');

          console.log('Parsing event:', { dateStr, name, location, website });

          if (name && date && !isNaN(date.getTime())) {
            festivals.push({
              id: this.generateId(),
              name,
              date,
              website: website ? new URL(website, this.baseUrl).toString() : undefined,
              locations: location ? [location] : [],
              source: 'partyflock',
              status: 'active',
              is_interested: false,
              last_updated: new Date()
            });
          } else {
            console.log('Skipping event due to missing or invalid data:', { name, date });
          }
        } catch (error) {
          console.warn(`Failed to parse festival event: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
    }

    return festivals;
  }
} 