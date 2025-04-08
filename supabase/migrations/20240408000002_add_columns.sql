-- Create a function to add the columns
CREATE OR REPLACE FUNCTION add_festival_columns()
RETURNS void AS $$
BEGIN
  -- Add artists column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'festivals'
    AND column_name = 'artists'
  ) THEN
    ALTER TABLE festivals ADD COLUMN artists JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add is_favorite column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'festivals'
    AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE festivals ADD COLUMN is_favorite BOOLEAN DEFAULT false;
  END IF;

  -- Set default values for existing rows
  UPDATE festivals SET artists = '[]'::jsonb WHERE artists IS NULL;
  UPDATE festivals SET is_favorite = false WHERE is_favorite IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT add_festival_columns();

-- Drop the function after use
DROP FUNCTION add_festival_columns(); 