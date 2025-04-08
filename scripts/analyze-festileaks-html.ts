import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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

async function analyzeFestileaksHtml() {
  try {
    // Read the HTML file
    const htmlPath = path.join(process.cwd(), 'test-data', 'Festivalagenda _ Festileaks.com.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    
    console.log('Analyzing Festileaks HTML structure...\n');
    
    const festivals: Festival[] = [];
    
    // Find all festival entries
    $('.festivals-list-item').each((i, element) => {
      const $festival = $(element);
      
      // Get festival name and URL
      const $nameLink = $festival.find('.festival-title');
      const name = $nameLink.text().trim();
      const url = $festival.find('a.festival-item').attr('href') || '';
      
      // Get date
      const dateText = $festival.find('.festival-date').text().trim();
      // Handle date ranges like "11-12 april 2025" or "12 april 2025"
      const dateMatch = dateText.match(/(\d{1,2})(?:-(\d{1,2}))?\s+([a-zA-Z]+)\s+(\d{4})/);
      
      if (name && dateMatch) {
        const [_, startDay, endDay, month, year] = dateMatch;
        const monthMap: { [key: string]: number } = {
          'januari': 0, 'februari': 1, 'maart': 2, 'april': 3,
          'mei': 4, 'juni': 5, 'juli': 6, 'augustus': 7,
          'september': 8, 'oktober': 9, 'november': 10, 'december': 11
        };
        
        // Use the first day of the festival
        const date = new Date(parseInt(year), monthMap[month.toLowerCase()], parseInt(startDay));
        
        // Get location
        const location = $festival.find('.festival-location span').last().text().trim();
        
        // Get status
        const statusElement = $festival.find('.festival-status');
        const status = statusElement.length ? statusElement.text().trim().toLowerCase() : 'active';
        
        if (!isNaN(date.getTime())) {
          festivals.push({
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
        } else if (i < 5) {
          console.log('Failed to parse date:', dateText);
        }
      } else if (i < 5) {
        console.log('Missing name or date:', { name, dateText });
      }
    });
    
    console.log(`Found ${festivals.length} festivals\n`);
    console.log('First 5 festivals:');
    festivals.slice(0, 5).forEach(festival => {
      console.log(`- ${festival.name}`);
      console.log(`  Location: ${festival.locations?.join(', ') || 'N/A'}`);
      console.log(`  Date: ${festival.date.toISOString()}`);
      console.log(`  Status: ${festival.status}`);
      console.log(`  URL: ${festival.website}\n`);
    });
    
    // Upload to Supabase
    console.log('Uploading to Supabase...');
    for (const festival of festivals) {
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

analyzeFestileaksHtml(); 