import { NextRequest, NextResponse } from 'next/server';
import { clearAllFestivals, supabase } from '@/lib/supabase/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Run the Partyflock scraper using the npm script
    console.log('Running Partyflock scraper...');
    const { stdout, stderr } = await execAsync('npm run clear-and-scrape:partyflock');
    
    if (stderr) {
      console.error('Error running scraper:', stderr);
      return NextResponse.json({ error: 'Failed to run scraper' }, { status: 500 });
    }
    
    console.log('Scraper output:', stdout);
    
    // Get the count of festivals from the database
    const { count, error } = await supabase
      .from('festivals')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'partyflock');
      
    if (error) {
      console.error('Error getting festival count:', error);
      return NextResponse.json({ error: 'Failed to get festival count' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully scraped and inserted festivals from Partyflock.`,
      count: count || 0
    });
  } catch (error) {
    console.error('Error running Partyflock scraper:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 