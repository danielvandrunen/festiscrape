import { NextRequest, NextResponse } from 'next/server';
import { clearAllFestivals, getSupabaseClient } from '@/lib/supabase/client';
import { PartyflockScraper } from '@/lib/scrapers/partyflock-scraper';

// Helper function to create a response with CORS headers
function corsResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return corsResponse({});
}

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Partyflock scraping process...');

    // Get Supabase client with environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey 
      });
      return corsResponse({ error: 'Configuration error: Missing Supabase credentials' }, 500);
    }

    // Run the Partyflock scraper first to minimize database operations
    console.log('Running Partyflock scraper...');
    let festivals;
    try {
      const scraper = new PartyflockScraper();
      festivals = await scraper.scrape();
      console.log(`Scraped ${festivals.length} festivals from Partyflock`);
      
      if (!festivals.length) {
        return corsResponse({ error: 'No festivals found' }, 404);
      }
    } catch (scrapeError) {
      console.error('Error during scraping:', scrapeError);
      return corsResponse({ error: 'Failed to scrape festivals' }, 500);
    }

    console.log('Clearing existing festivals...');
    try {
      // Clear all festivals
      const deletedCount = await clearAllFestivals(supabaseUrl, supabaseKey);
      console.log(`Deleted ${deletedCount} festivals from the database.`);
    } catch (clearError) {
      console.error('Error clearing festivals:', clearError);
      return corsResponse({ error: 'Failed to clear existing festivals' }, 500);
    }

    // Insert festivals into database in batches
    console.log('Inserting festivals into database...');
    try {
      const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
      const batchSize = 100;
      
      for (let i = 0; i < festivals.length; i += batchSize) {
        const batch = festivals.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('festivals')
          .insert(batch);
          
        if (insertError) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
          return corsResponse({ error: 'Failed to insert festivals into database' }, 500);
        }
        console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(festivals.length / batchSize)}`);
      }
    } catch (insertError) {
      console.error('Error during database insertion:', insertError);
      return corsResponse({ error: 'Failed to insert festivals into database' }, 500);
    }

    // Get the count of festivals from the database
    console.log('Getting final festival count...');
    try {
      const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
      const { count, error: countError } = await supabase
        .from('festivals')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'partyflock');
        
      if (countError) {
        console.error('Error getting festival count:', countError);
        return corsResponse({ error: 'Failed to get festival count' }, 500);
      }

      console.log('Scraping process completed successfully');
      return corsResponse({ 
        success: true, 
        message: `Successfully scraped and inserted ${festivals.length} festivals from Partyflock.`,
        count: count || 0
      });
    } catch (countError) {
      console.error('Error getting final count:', countError);
      return corsResponse({ error: 'Failed to get final festival count' }, 500);
    }
  } catch (error) {
    console.error('Unexpected error in scraping process:', error);
    return corsResponse({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
} 