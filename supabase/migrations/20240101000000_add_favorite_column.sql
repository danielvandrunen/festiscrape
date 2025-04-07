-- Add is_favorite column to festivals table
ALTER TABLE festivals ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Create a function to add the is_favorite column
CREATE OR REPLACE FUNCTION add_favorite_column()
RETURNS void AS $$
BEGIN
  -- Check if the column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'festivals'
    AND column_name = 'is_favorite'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE festivals ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql; 