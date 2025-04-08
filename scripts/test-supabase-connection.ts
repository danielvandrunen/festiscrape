import { createClient } from '@supabase/supabase-js';
import fetch from 'cross-fetch';

const PROJECT_REF = 'ykbmxkzxbcfqjqfnqrqc';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrYm14a3p4YmNmcWpxZm5xcnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0OTY5NzAsImV4cCI6MjAyMzA3Mjk3MH0.Ue_WS1NHgiBVgX-TF0kYoVcT_vNviBDjg_lHHBUXvYE';

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', SUPABASE_URL);
  
  try {
    // First test a direct fetch to the Supabase REST API
    console.log('Testing direct fetch to Supabase REST API...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/festivals?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    console.log('Direct fetch response status:', response.status);
    const data = await response.json();
    console.log('Direct fetch response data:', data);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false
      },
      global: {
        fetch: fetch
      }
    });
    
    // Try a simple query
    console.log('Attempting to query the database using Supabase client...');
    const { data: festivals, error } = await supabase
      .from('festivals')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Query result:', festivals);
    
  } catch (error) {
    console.error('Connection error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

testConnection(); 