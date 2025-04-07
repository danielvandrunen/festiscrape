import { supabase } from '../lib/supabase/client';

async function addFavoriteColumn() {
  console.log('Checking if is_favorite column exists...');
  
  try {
    // First, check if the column exists
    const { data, error } = await supabase
      .from('festivals')
      .select('is_favorite')
      .limit(1);
    
    if (error && error.message.includes('column "is_favorite" does not exist')) {
      console.log('is_favorite column does not exist. Adding it...');
      
      // Add the column using SQL
      const { error: alterError } = await supabase.rpc('add_favorite_column');
      
      if (alterError) {
        console.error('Error adding is_favorite column:', alterError);
        return;
      }
      
      console.log('Successfully added is_favorite column!');
    } else if (error) {
      console.error('Error checking for is_favorite column:', error);
    } else {
      console.log('is_favorite column already exists.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
addFavoriteColumn(); 