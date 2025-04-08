import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Festival {
  id: string;
  name: string;
  date: string;
  website?: string;
  locations?: string[];
  source: string;
  status: string;
}

async function checkFestivalsByMonth() {
  try {
    console.log('Fetching festivals from Supabase...');
    
    // Fetch all festivals
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching festivals:', error);
      return;
    }

    if (!data) {
      console.log('No data returned from Supabase');
      return;
    }

    const festivals = data as Festival[];
    console.log(`Total festivals found: ${festivals.length}`);

    // Group festivals by month
    const festivalsByMonth = festivals.reduce((acc, festival) => {
      const date = new Date(festival.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      
      acc[monthKey].push(festival);
      return acc;
    }, {} as Record<string, Festival[]>);

    // Display count for each month
    console.log('\nFestivals by month:');
    Object.entries(festivalsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, monthFestivals]) => {
        console.log(`${month}: ${monthFestivals.length} festivals`);
        
        // List the first 3 festivals for each month
        if (monthFestivals.length > 0) {
          console.log('  Sample festivals:');
          monthFestivals.slice(0, 3).forEach(festival => {
            console.log(`  - ${festival.name} (${festival.date})`);
          });
        }
      });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
checkFestivalsByMonth(); 