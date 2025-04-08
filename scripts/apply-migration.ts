import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bezlkvvsjdgcuoibixhv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemxrdnZzamRnY3VvaWJpeGh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAxMjA0MCwiZXhwIjoyMDU5NTg4MDQwfQ.UCWoN_8Tq_TwoPHxjv4LgeJwpqL3lZbMG5qPhEwGhy4';

async function applyMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: 'public' }
  });

  try {
    // Execute SQL directly to add the columns
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add missing columns
        ALTER TABLE festivals ADD COLUMN IF NOT EXISTS artists JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE festivals ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

        -- Set default values for existing rows
        UPDATE festivals SET artists = '[]'::jsonb WHERE artists IS NULL;
        UPDATE festivals SET is_favorite = false WHERE is_favorite IS NULL;

        -- Notify PostgREST to reload its schema cache
        NOTIFY pgrst, 'reload schema';
      `
    });

    if (sqlError) {
      console.error('Error executing SQL:', sqlError);
      throw sqlError;
    }

    console.log('Successfully added columns to festivals table');
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  }
}

applyMigration().catch(console.error); 