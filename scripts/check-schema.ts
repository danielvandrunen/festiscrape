import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bezlkvvsjdgcuoibixhv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemxrdnZzamRnY3VvaWJpeGh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAxMjA0MCwiZXhwIjoyMDU5NTg4MDQwfQ.UCWoN_8Tq_TwoPHxjv4LgeJwpqL3lZbMG5qPhEwGhy4';

async function checkSchema() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: 'public' }
  });

  try {
    // Get all columns from the festivals table
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking schema:', error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log('Table schema:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No data in festivals table');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

checkSchema().catch(console.error); 