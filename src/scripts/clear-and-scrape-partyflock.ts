import { createClient } from '@supabase/supabase-js';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Festival {
  id: string;
  name: string;
  date: string;
  website: string;
  locations: string[];
  source: string;
  status: string;
  is_interested: boolean;
  last_updated: string;
}

interface PartyflockEvent {
  name: string;
  date: string;
  location: string;
  lineup: string[];
  url: string;
}

async function scrapePartyflock(): Promise<Festival[]> {
  const url = 'https://partyflock.nl/agenda/festivals';
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const events: PartyflockEvent[] = [];
  const festivalRows = document.querySelectorAll('tbody.hl tr');

  festivalRows.forEach((element: Element) => {
    try {
      const nameElement = element.querySelector('span[itemprop="name"]');
      const dateElement = element.querySelector('meta[itemprop="startDate"]');
      const locationElement = element.querySelector('td:nth-child(2)');
      const lineupElement = element.querySelector('tr.hidden.lineuprow');
      const linkElement = element.querySelector('a[href*="/event/"]');

      if (nameElement && dateElement && locationElement && linkElement) {
        const name = nameElement.textContent?.trim() || '';
        const date = dateElement.getAttribute('content') || '';
        const location = locationElement.textContent?.trim() || '';
        const lineup = lineupElement ? 
          Array.from(lineupElement.querySelectorAll('a'))
            .map((link: Element) => link.textContent?.trim() || '')
            .filter(Boolean) : 
          [];
        const url = linkElement.getAttribute('href') || '';

        events.push({
          name,
          date,
          location,
          lineup,
          url: url.startsWith('http') ? url : `https://partyflock.nl${url}`
        });
      }
    } catch (error) {
      console.error('Error parsing festival row:', error);
    }
  });

  return events.map((event: PartyflockEvent) => ({
    id: `partyflock-${event.url.split('/').pop()}`,
    name: event.name,
    date: event.date,
    website: event.url,
    locations: [event.location],
    source: 'partyflock',
    status: 'active',
    is_interested: false,
    last_updated: new Date().toISOString()
  }));
}

async function clearAndScrape() {
  try {
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('festivals')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      throw deleteError;
    }

    console.log('Existing data cleared');

    // Scrape new data
    const festivals = await scrapePartyflock();
    console.log(`Scraped ${festivals.length} festivals`);

    // Insert new data
    const { error: insertError } = await supabase
      .from('festivals')
      .insert(festivals);

    if (insertError) {
      throw insertError;
    }

    console.log('Data successfully inserted');
  } catch (error) {
    console.error('Error in clearAndScrape:', error);
  }
}

clearAndScrape(); 