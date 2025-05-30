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

async function analyzePartyflockHtml() {
  try {
    // Read the HTML file
    const htmlPath = path.join(process.cwd(), 'test-data', 'festivals & strandfeesten · festival agenda.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    
    console.log('Analyzing Partyflock HTML structure...\n');
    
    const festivals: Festival[] = [];
    
    // Find all festival rows in the tables
    $('tbody.hl').each((i, element) => {
      const $row = $(element).find('tr').first();
      if (!$row.length) return;
      
      // Get festival info from the row
      const $cells = $row.find('td');
      const $nameCell = $cells.eq(0);
      const $locationCell = $cells.eq(2);
      
      // Get the date from the meta tag
      const dateText = $nameCell.find('meta[itemprop="startDate"]').attr('content');
      
      // Debug output for the first few rows
      if (i < 5) {
        console.log('\nAnalyzing row:', i + 1);
        console.log('Date text:', dateText);
        console.log('Row HTML:', $row.html());
      }
      
      const $link = $nameCell.find('a').first();
      const name = $link.text().trim();
      const url = $link.attr('href') || '';
      
      // Get location from the first link in the location cell
      const $locationLink = $locationCell.find('a').first();
      const location = $locationLink.length ? $locationLink.text().trim() : $locationCell.text().trim();
      
      if (name && dateText) {
        const date = new Date(dateText);
        if (!isNaN(date.getTime())) {
          festivals.push({
            id: uuidv4(),
            name,
            date,
            website: url.startsWith('http') ? url : `https://partyflock.nl${url}`,
            locations: location ? [location] : undefined,
            source: 'partyflock',
            status: 'active',
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

analyzePartyflockHtml(); 