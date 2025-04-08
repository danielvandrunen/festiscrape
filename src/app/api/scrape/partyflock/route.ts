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

export const maxDuration = 60; // 1 minute
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

    // Insert festivals into database in smaller batches
    console.log('Inserting festivals into database...');
    try {
      const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
      const batchSize = 50; // Smaller batch size for faster processing
      
      // Clear existing festivals first
      await clearAllFestivals(supabaseUrl, supabaseKey);
      
      // Process first batch immediately
      const firstBatch = festivals.slice(0, batchSize);
      const { error: insertError } = await supabase
        .from('festivals')
        .insert(firstBatch);
        
      if (insertError) {
        console.error('Error inserting first batch:', insertError);
        return corsResponse({ error: 'Failed to insert festivals into database' }, 500);
      }

      // Return success response with initial batch info
      return corsResponse({ 
        success: true, 
        message: `Successfully scraped ${festivals.length} festivals and inserted first batch of ${firstBatch.length} festivals.`,
        totalFestivals: festivals.length,
        insertedFestivals: firstBatch.length,
        remainingFestivals: festivals.length - firstBatch.length
      });

    } catch (error) {
      console.error('Error during database operation:', error);
      return corsResponse({ error: 'Failed to process festivals' }, 500);
    }
  } catch (error) {
    console.error('Unexpected error in scraping process:', error);
    return corsResponse({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
} 