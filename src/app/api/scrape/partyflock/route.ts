import { NextRequest, NextResponse } from 'next/server';
import { PartyflockScraper } from '../../../../../scripts/scrapers/partyflock.js';
import { clearAllFestivals, supabase } from '../../../../lib/supabase/client.js';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    // In a real app, you would validate this token against your auth system
    // For now, we'll just check if it's not empty
    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Clear all festivals
    const deletedCount = await clearAllFestivals();
    console.log(`Deleted ${deletedCount} festivals from the database.`);

    // Run the Partyflock scraper
    const scraper = new PartyflockScraper();
    const festivals = await scraper.scrape();
    console.log(`Found ${festivals.length} festivals from Partyflock.`);

    // Insert festivals into the database
    const { data, error } = await supabase
      .from('festivals')
      .insert(festivals);

    if (error) {
      console.error('Error inserting festivals:', error);
      return NextResponse.json({ error: 'Failed to insert festivals' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully scraped and inserted ${festivals.length} festivals from Partyflock.`,
      count: festivals.length
    });
  } catch (error) {
    console.error('Error running Partyflock scraper:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 