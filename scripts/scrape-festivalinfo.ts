import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Festival {
  name: string;
  date: string;
  location?: string;
  status?: string;
  website?: string;
}

const PROGRESS_FILE = 'festivalinfo-progress.json';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const BASE_URL = 'https://www.festivalinfo.nl/festivals/';
const MAX_CONSECUTIVE_ERRORS = 3;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanJsonString(str: string): string {
  // Remove control characters and escape special characters
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

async function processFestivalsFromHtml(html: string): Promise<Festival[]> {
  const $ = cheerio.load(html);
  const festivals: Festival[] = [];
  const seen = new Set<string>();

  // Find all JSON-LD scripts
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const jsonStr = cleanJsonString($(element).html() || '');
      const jsonData = JSON.parse(jsonStr);
      
      // Check if it's a festival
      if (jsonData['@type'] === 'Festival') {
        const key = `${jsonData.name}-${jsonData.startDate}`;
        if (!seen.has(key)) {
          seen.add(key);
          
          const festival: Festival = {
            name: jsonData.name,
            date: jsonData.startDate,
            location: `${jsonData.location.address.addressLocality} (${jsonData.location.address.addressCountry})`,
            status: jsonData.eventStatus === 'https://schema.org/EventScheduled' ? 'active' : 'cancelled',
            website: jsonData.url
          };
          festivals.push(festival);
        }
      }
    } catch (e) {
      console.error('Error parsing JSON-LD:', e);
    }
  });

  return festivals;
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left for URL: ${url}`);
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Exponential backoff
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

async function saveProgress(page: number, totalFestivals: number) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastPage: page, totalFestivals }));
}

function loadProgress(): { lastPage: number; totalFestivals: number } {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch {
    return { lastPage: 0, totalFestivals: 0 };
  }
}

async function uploadToSupabase(festivals: Festival[]) {
  try {
    const { error } = await supabase
      .from('festivals')
      .insert(
        festivals.map(festival => ({
          name: festival.name,
          date: festival.date,
          status: festival.status,
          website: festival.website,
          source: 'festivalinfo'
        }))
      );

    if (error) {
      console.error('Error uploading to Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    return false;
  }
}

async function scrapeFestivalinfo() {
  console.log('Starting to scrape Festivalinfo.nl...');
  
  const progress = loadProgress();
  let currentPage = progress.lastPage;
  let totalFestivals = progress.totalFestivals;
  let consecutiveErrors = 0;
  let hasMorePages = true;

  // First process the saved file if we're starting fresh
  if (currentPage === 0) {
    const savedHtml = fs.readFileSync('test-data/Festival agenda van Festivalinfo.html', 'utf8');
    const festivals = await processFestivalsFromHtml(savedHtml);
    console.log(`Found ${festivals.length} festivals on the first page`);
    
    if (festivals.length > 0) {
      console.log('\nFirst 5 festivals:');
      festivals.slice(0, 5).forEach(festival => {
        console.log(`${festival.name}: Location: ${festival.location}, Date: ${festival.date}, Status: ${festival.status}, URL: ${festival.website}`);
      });

      const uploaded = await uploadToSupabase(festivals);
      if (uploaded) {
        totalFestivals += festivals.length;
        await saveProgress(1, totalFestivals);
        currentPage = 1;
      }
    }
  }

  // Now fetch additional pages
  while (hasMorePages && consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
    currentPage++;
    console.log(`\nFetching page ${currentPage}...`);

    try {
      // Use the correct pagination URL pattern
      const html = await fetchWithRetry(`${BASE_URL}?page=${currentPage}`);
      const festivals = await processFestivalsFromHtml(html);
      
      if (festivals.length === 0) {
        console.log('No festivals found on this page. Ending pagination.');
        hasMorePages = false;
        break;
      }

      console.log(`Found ${festivals.length} festivals on page ${currentPage}`);
      const uploaded = await uploadToSupabase(festivals);
      
      if (uploaded) {
        totalFestivals += festivals.length;
        await saveProgress(currentPage, totalFestivals);
        consecutiveErrors = 0;
      } else {
        consecutiveErrors++;
      }

      // Add a delay between requests to be polite to the server
      await delay(2000);

    } catch (error) {
      console.error(`Error processing page ${currentPage}:`, error);
      consecutiveErrors++;
      
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.log(`Too many consecutive errors (${consecutiveErrors}). Stopping pagination.`);
        break;
      }
    }
  }

  console.log(`\nFinished scraping. Total festivals found: ${totalFestivals}`);
  
  // Clean up progress file if we're done
  if (!hasMorePages || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    try {
      fs.unlinkSync(PROGRESS_FILE);
    } catch {
      // Ignore error if file doesn't exist
    }
  }
}

scrapeFestivalinfo(); 