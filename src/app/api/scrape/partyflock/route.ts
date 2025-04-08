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

export async function POST(request: NextRequest) {
  try {
    // Get Supabase client with environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return corsResponse({ error: 'Configuration error' }, 500);
    }

    // Clear all festivals
    const deletedCount = await clearAllFestivals(supabaseUrl, supabaseKey);
    console.log(`Deleted ${deletedCount} festivals from the database.`);

    // Run the Partyflock scraper directly
    console.log('Running Partyflock scraper...');
    const scraper = new PartyflockScraper();
    const festivals = await scraper.scrape();
    
    // Insert festivals into database
    const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
    const { error: insertError } = await supabase
      .from('festivals')
      .insert(festivals);
      
    if (insertError) {
      console.error('Error inserting festivals:', insertError);
      return corsResponse({ error: 'Failed to insert festivals' }, 500);
    }

    // Get the count of festivals from the database
    const { count, error: countError } = await supabase
      .from('festivals')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'partyflock');
      
    if (countError) {
      console.error('Error getting festival count:', countError);
      return corsResponse({ error: 'Failed to get festival count' }, 500);
    }

    return corsResponse({ 
      success: true, 
      message: `Successfully scraped and inserted ${festivals.length} festivals from Partyflock.`,
      count: count || 0
    });
  } catch (error) {
    console.error('Error running Partyflock scraper:', error);
    return corsResponse({ error: 'Internal server error' }, 500);
  }
} 