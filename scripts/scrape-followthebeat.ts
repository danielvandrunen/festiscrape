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

const PROGRESS_FILE = path.join(process.cwd(), 'test-data', 'followthebeat-progress.json');
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request to ${url} (${retries} attempts remaining)...`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

async function saveProgress(festivals: Festival[], lastPage: number) {
  const progress = {
    festivals: festivals.map(f => ({
      ...f,
      date: f.date.toISOString(),
      last_updated: f.last_updated.toISOString()
    })),
    lastPage
  };
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function loadProgress(): Promise<{ festivals: Festival[], lastPage: number } | null> {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    return {
      festivals: data.festivals.map((f: any) => ({
        ...f,
        date: new Date(f.date),
        last_updated: new Date(f.last_updated)
      })),
      lastPage: data.lastPage
    };
  }
  return null;
}

async function scrapeFollowTheBeat() {
  try {
    console.log('Starting to process Follow The Beat data...');
    
    // Try to load progress
    const progress = await loadProgress();
    const processedFestivals: Festival[] = progress?.festivals || [];
    const processedFestivalsByName = new Set<string>(processedFestivals.map(f => f.name));
    let startPage = progress?.lastPage ? progress.lastPage + 1 : 1;
    
    if (progress) {
      console.log(`Resuming from page ${startPage} with ${processedFestivals.length} festivals...`);
    }
    
    // First, process the saved HTML file if we're starting fresh
    if (!progress) {
      console.log('Processing saved HTML file...');
      const savedHtmlPath = path.join(process.cwd(), 'test-data', 'followthebeat.html');
      const savedHtmlContent = fs.readFileSync(savedHtmlPath, 'utf-8');
      await processFestivalsFromHtml(savedHtmlContent, processedFestivals, processedFestivalsByName);
    }
    
    // Then fetch and process additional pages
    const baseUrl = 'https://followthebeat.nl/agenda/';
    let currentPage = startPage;
    let hasMorePages = true;
    let consecutiveErrors = 0;
    
    while (hasMorePages && consecutiveErrors < MAX_RETRIES) {
      console.log(`Fetching page ${currentPage}...`);
      
      try {
        const html = await fetchWithRetry(`${baseUrl}page/${currentPage}/`);
        const $ = cheerio.load(html);
        const festivalElements = $('.relative.flex.gap-4.items-center.py-1');
        
        if (festivalElements.length === 0) {
          console.log('No more festivals found. Reached the end of pagination.');
          hasMorePages = false;
          break;
        }
        
        await processFestivalsFromHtml(html, processedFestivals, processedFestivalsByName);
        
        // Save progress after each successful page
        await saveProgress(processedFestivals, currentPage);
        
        // Reset consecutive errors counter on success
        consecutiveErrors = 0;
        
        // Add a small delay between requests to avoid overloading the server
        await delay(2000);
        
        currentPage++;
      } catch (error) {
        console.error(`Error fetching page ${currentPage}:`, error);
        consecutiveErrors++;
        
        if (consecutiveErrors < MAX_RETRIES) {
          console.log(`Retrying after error (attempt ${consecutiveErrors} of ${MAX_RETRIES})...`);
          await delay(RETRY_DELAY);
        } else {
          console.log('Too many consecutive errors. Stopping...');
          hasMorePages = false;
        }
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
    
    // Clean up progress file after successful completion
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
    
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
  const festivalElements = $('.relative.flex.gap-4.items-center.py-1');
  
  console.log(`Found ${festivalElements.length} festivals on this page`);
  
  festivalElements.each((_, element) => {
    const festivalElement = $(element);
    
    // Get festival name
    const name = festivalElement.find('h2 a').text().trim();
    
    // Skip if we've already processed this festival
    if (processedFestivalsByName.has(name)) {
      return;
    }
    
    // Get festival URL
    const url = festivalElement.find('h2 a').attr('href') || '';
    
    // Get festival date
    const dateText = festivalElement.find('.text-purple.text-lg').text().trim();
    const monthText = festivalElement.find('.text-purple.text-lg + p').text().trim();
    
    // Get festival location
    const location = festivalElement.find('a[href*="/locaties/"]').text().trim();
    const city = festivalElement.find('a[href*="/agenda/stad/"]').text().trim();
    
    // Get festival status (assuming all are active unless specified otherwise)
    const status = 'active';
    
    // Parse the date
    const monthMap: { [key: string]: number } = {
      'jan': 0, 'feb': 1, 'mrt': 2, 'apr': 3,
      'mei': 4, 'jun': 5, 'jul': 6, 'aug': 7,
      'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11
    };
    
    const day = parseInt(dateText);
    const month = monthMap[monthText.toLowerCase()];
    const year = new Date().getFullYear();
    
    const date = new Date(year, month, day);
    
    if (!isNaN(date.getTime())) {
      processedFestivalsByName.add(name);
      processedFestivals.push({
        id: uuidv4(),
        name,
        date,
        website: url,
        locations: [location, city].filter(Boolean),
        source: 'followthebeat',
        status,
        is_interested: false,
        last_updated: new Date()
      });
    }
  });
}

scrapeFollowTheBeat(); 