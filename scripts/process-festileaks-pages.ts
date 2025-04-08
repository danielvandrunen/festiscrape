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

async function processFestileaksPages() {
  try {
    // Directory containing the HTML files
    const pagesDir = path.join(process.cwd(), 'test-data', 'festileaks-pages');
    
    // Check if the directory exists
    if (!fs.existsSync(pagesDir)) {
      console.error(`Directory not found: ${pagesDir}`);
      console.log('Please run the scrape-festileaks-pages.ts script first.');
      return;
    }
    
    // Get all HTML files in the directory
    const files = fs.readdirSync(pagesDir)
      .filter(file => file.endsWith('.html'))
      .sort((a, b) => {
        // Sort by page number
        const pageA = parseInt(a.match(/page-(\d+)\.html/)?.[1] || '0');
        const pageB = parseInt(b.match(/page-(\d+)\.html/)?.[1] || '0');
        return pageA - pageB;
      });
    
    console.log(`Found ${files.length} HTML files to process\n`);
    
    const festivals: Festival[] = [];
    const processedFestivals = new Set<string>(); // To avoid duplicates
    
    // Process each HTML file
    for (const file of files) {
      console.log(`Processing ${file}...`);
      
      const filePath = path.join(pagesDir, file);
      const html = fs.readFileSync(filePath, 'utf8');
      
      // Load the HTML into cheerio
      const $ = cheerio.load(html);
      
      // Find all festival entries - updated selector to match actual HTML structure
      $('a.festival-item').each((i, element) => {
        const $festival = $(element);
        
        // Get festival name and URL
        const name = $festival.find('.festival-title').text().trim();
        const url = $festival.attr('href') || '';
        
        // Skip if we've already processed this festival
        if (processedFestivals.has(name)) {
          return;
        }
        
        processedFestivals.add(name);
        
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
          }
        }
      });
    }
    
    console.log(`\nFound ${festivals.length} unique festivals\n`);
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

processFestileaksPages(); 