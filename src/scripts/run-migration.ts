import { supabase } from '../lib/supabase/client';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  console.log('Running migration to add is_favorite column...');
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240101000000_add_favorite_column.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error running migration:', error);
      return;
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
runMigration(); 