import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkFestivals() {
  console.log('Checking festivals in Supabase...');
  
  try {
    // Count all festivals
    const { count: totalCount, error: totalError } = await supabase
      .from('festivals')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('Error counting total festivals:', totalError);
      return;
    }
    
    console.log(`Total festivals in database: ${totalCount}`);
    
    // Count festivals from Festivalinfo.nl
    const { count: festivalInfoCount, error: festivalInfoError } = await supabase
      .from('festivals')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'festivalinfo');
    
    if (festivalInfoError) {
      console.error('Error counting Festivalinfo.nl festivals:', festivalInfoError);
      return;
    }
    
    console.log(`Festivals from Festivalinfo.nl: ${festivalInfoCount}`);
    
    // Get a sample of festivals
    const { data: sampleFestivals, error: sampleError } = await supabase
      .from('festivals')
      .select('*')
      .eq('source', 'festivalinfo')
      .limit(5);
    
    if (sampleError) {
      console.error('Error getting sample festivals:', sampleError);
      return;
    }
    
    console.log('\nSample festivals:');
    sampleFestivals.forEach(festival => {
      console.log(`${festival.name}: Date: ${festival.date}, Status: ${festival.status}, URL: ${festival.website}`);
    });
    
  } catch (error) {
    console.error('Error checking festivals:', error);
  }
}

checkFestivals(); 