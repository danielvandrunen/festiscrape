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

async function scrapeEbLive() {
  try {
    console.log('Starting to process EB Live data...');
    
    const processedFestivals: Festival[] = [];
    const processedFestivalsByName = new Set<string>();
    
    // First, process the saved HTML file
    console.log('Processing saved HTML file...');
    const savedHtmlPath = path.join(process.cwd(), 'test-data', 'Festivals - EB LIVE.html');
    const savedHtmlContent = fs.readFileSync(savedHtmlPath, 'utf-8');
    await processFestivalsFromHtml(savedHtmlContent, processedFestivals, processedFestivalsByName);
    
    // Then fetch and process additional pages
    const baseUrl = 'https://www.eblive.nl/festivals/';
    const params = {
      'filters[search]': '',
      'filters[address]': '',
      'filters[distance]': '',
      'order_by': 'upcoming'
    };
    
    let currentPage = 2;
    let hasMorePages = true;
    
    while (hasMorePages) {
      console.log(`Fetching page ${currentPage}...`);
      
      try {
        const response = await axios.get(baseUrl, {
          params: {
            ...params,
            'page_nr': currentPage
          },
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        // Check if the page has any festivals
        const $ = cheerio.load(response.data);
        const festivalElements = $('.festival');
        
        if (festivalElements.length === 0) {
          console.log('No more festivals found. Reached the end of pagination.');
          hasMorePages = false;
          break;
        }
        
        await processFestivalsFromHtml(response.data, processedFestivals, processedFestivalsByName);
        
        // Add a small delay between requests to avoid overloading the server
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        currentPage++;
      } catch (error) {
        console.error(`Error fetching page ${currentPage}:`, error);
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

async function processFestivalsFromHtml(
  html: string,
  processedFestivals: Festival[],
  processedFestivalsByName: Set<string>
) {
  const $ = cheerio.load(html);
  const festivalElements = $('.festival');
  
  console.log(`Found ${festivalElements.length} festivals on this page`);
  
  festivalElements.each((_, element) => {
    const festivalElement = $(element);
    
    // Get festival name
    const name = festivalElement.find('.festival-name a').text().trim();
    
    // Skip if we've already processed this festival
    if (processedFestivalsByName.has(name)) {
      return;
    }
    
    // Get festival URL
    const url = festivalElement.find('.festival-name a').attr('href') || '';
    
    // Get festival date
    const dateText = festivalElement.find('.festival-date span').text().trim();
    
    // Get festival location
    const location = festivalElement.find('.festival-location span').text().trim();
    
    // Get festival status (assuming all are active unless specified otherwise)
    const status = 'active';
    
    // Parse the date
    // Handle different date formats:
    // - "Vr 18 apr t/m zo 20 apr"
    // - "Za 19 apr t/m zo 20 apr"
    // - "Zondag 20 april"
    // - "Maandag 21 april"
    // - "Vr 18 apr t/m ma 21 apr"
    
    let startDate: Date | null = null;
    
    const monthMap: { [key: string]: number } = {
      'jan': 0, 'feb': 1, 'mrt': 2, 'apr': 3,
      'mei': 4, 'jun': 5, 'jul': 6, 'aug': 7,
      'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11,
      'januari': 0, 'februari': 1, 'maart': 2, 'april': 3,
      'juni': 5, 'juli': 6, 'augustus': 7,
      'september': 8, 'oktober': 9, 'november': 10, 'december': 11
    };
    
    const dayMap: { [key: string]: string } = {
      'Maandag': 'ma',
      'Dinsdag': 'di',
      'Woensdag': 'wo',
      'Donderdag': 'do',
      'Vrijdag': 'vr',
      'Zaterdag': 'za',
      'Zondag': 'zo'
    };
    
    // Convert full day names to abbreviated versions
    const normalizedDateText = Object.entries(dayMap).reduce(
      (text, [full, abbr]) => text.replace(new RegExp(full, 'g'), abbr),
      dateText
    );
    
    // Try to match different date formats
    const rangeMatch = normalizedDateText.match(/([a-z]{2})\s+(\d{1,2})\s+([a-z]+)(?:\s+t\/m\s+[a-z]{2}\s+\d{1,2}\s+[a-z]+)?/i);
    const singleMatch = normalizedDateText.match(/(\d{1,2})\s+([a-z]+)/i);
    
    if (rangeMatch) {
      const [_, dayOfWeek, day, month] = rangeMatch;
      // Assume current year since it's not provided
      const year = new Date().getFullYear();
      startDate = new Date(year, monthMap[month.toLowerCase()], parseInt(day));
    } else if (singleMatch) {
      const [_, day, month] = singleMatch;
      // Assume current year since it's not provided
      const year = new Date().getFullYear();
      startDate = new Date(year, monthMap[month.toLowerCase()], parseInt(day));
    }
    
    if (startDate && !isNaN(startDate.getTime())) {
      processedFestivalsByName.add(name);
      processedFestivals.push({
        id: uuidv4(),
        name,
        date: startDate,
        website: url.startsWith('http') ? url : `https://www.eblive.nl${url}`,
        locations: location ? [location] : undefined,
        source: 'eblive',
        status,
        is_interested: false,
        last_updated: new Date()
      });
    }
  });
}

scrapeEbLive(); 