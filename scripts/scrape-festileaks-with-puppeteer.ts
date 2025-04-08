import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as cheerio from 'cheerio';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Festival {
  id: string;
  name: string;
  date: Date;
  website?: string;
  locations?: string[];
  source: string;
  status: string;
  is_interested: boolean;
  last_updated: Date;
}

async function scrapeFestileaksWithAjax() {
  try {
    console.log('Starting to fetch Festileaks data...');
    
    const baseUrl = 'https://festileaks.com/wp-content/themes/festileaks/inc/agenda-ajax/search_results.php';
    const params = {
      event_title: '',
      event_startdate: '2025-04-07',
      event_enddate: '2026-04-07',
      country_id: '0',
      city_id: '0',
      terrain_id: '0',
      artists: '',
      genres: '',
      ticketprice_min: '0',
      ticketprice_max: '2650',
      cap_min: '0',
      cap_max: '1400000',
      weekender: 'true',
      soldout: 'true',
      cancelled: 'true',
      organizer: '0',
      label_slug: '',
      results: '20'
    };

    const processedFestivals: Festival[] = [];
    const processedFestivalsByName = new Set<string>();
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`Fetching page ${page}...`);
      
      try {
        const response = await axios.get(baseUrl, {
          params: {
            ...params,
            pg: page
          },
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        const festivalElements = $('a.festival-item');

        if (festivalElements.length === 0) {
          hasMorePages = false;
          break;
        }

        festivalElements.each((_, element) => {
          const festivalElement = $(element);
          
          // Get festival name
          const name = festivalElement.find('.festival-title').text().trim();
          
          // Skip if we've already processed this festival
          if (processedFestivalsByName.has(name)) {
            return;
          }
          
          // Get festival URL
          const url = festivalElement.attr('href') || '';
          
          // Get festival date
          const dateText = festivalElement.find('.festival-date').text().trim();
          
          // Get festival location
          const location = festivalElement.find('.festival-location span:last-child').text().trim();
          
          // Get festival status
          const status = festivalElement.find('.festival-status').text().trim().toLowerCase() || 'active';
          
          // Parse the date
          const dateMatch = dateText.match(/(\d{1,2})(?:-(\d{1,2}))?\s+([a-zA-Z]+)\s+(\d{4})/);
          
          if (dateMatch && name) {
            const [_, startDay, endDay, month, year] = dateMatch;
            const monthMap: { [key: string]: number } = {
              'januari': 0, 'februari': 1, 'maart': 2, 'april': 3,
              'mei': 4, 'juni': 5, 'juli': 6, 'augustus': 7,
              'september': 8, 'oktober': 9, 'november': 10, 'december': 11
            };
            
            // Use the first day of the festival
            const date = new Date(parseInt(year), monthMap[month.toLowerCase()], parseInt(startDay));
            
            if (!isNaN(date.getTime())) {
              processedFestivalsByName.add(name);
              processedFestivals.push({
                id: uuidv4(),
                name,
                date,
                website: url.startsWith('http') ? url : `https://festileaks.com${url}`,
                locations: location ? [location] : undefined,
                source: 'festileaks',
                status,
                is_interested: false,
                last_updated: new Date()
              });
            }
          }
        });

        console.log(`Found ${festivalElements.length} festivals on page ${page}`);
        
        // Check if there's a next page by looking for pagination links with the exact format from the example
        const nextPageExists = $('a').filter((_, el) => {
          const $el = $(el);
          const href = $el.attr('href') || '';
          const input = $el.find('input.pagnr');
          return href.includes('search_results.php') && 
                 href.includes('pg=' + (page + 1)) && 
                 input.length > 0 && 
                 input.val() === (page + 1).toString();
        }).length > 0;
        
        if (!nextPageExists) {
          hasMorePages = false;
        } else {
          page++;
          // Add a small delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        hasMorePages = false;
      }
    }

    console.log(`\nProcessed ${processedFestivals.length} unique festivals\n`);
    console.log('First 5 festivals:');
    processedFestivals.slice(0, 5).forEach(festival => {
      console.log(`- ${festival.name}`);
      console.log(`  Location: ${festival.locations?.join(', ') || 'N/A'}`);
      console.log(`  Date: ${festival.date.toISOString()}`);
      console.log(`  Status: ${festival.status}`);
      console.log(`  URL: ${festival.website}\n`);
    });

    // Upload to Supabase
    console.log('Uploading to Supabase...');
    for (const festival of processedFestivals) {
      const { error } = await supabase
        .from('festivals')
        .upsert(
          {
            ...festival,
            date: festival.date.toISOString(),
            last_updated: festival.last_updated.toISOString(),
          },
          {
            onConflict: 'id'
          }
        );
      
      if (error) {
        console.error(`Error upserting festival ${festival.name}:`, error);
      }
    }

    console.log('Upload complete!');

  } catch (error) {
    console.error('Error:', error);
  }
}

scrapeFestileaksWithAjax(); 