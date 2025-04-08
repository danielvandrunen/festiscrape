-- Add artists column to festivals table
ALTER TABLE festivals ADD COLUMN IF NOT EXISTS artists JSONB DEFAULT '[]'::jsonb;

-- Create a function to add the artists column
CREATE OR REPLACE FUNCTION add_artists_column()
RETURNS void AS $$
BEGIN
  -- Check if the column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'festivals'
    AND column_name = 'artists'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE festivals ADD COLUMN artists JSONB DEFAULT '[]'::jsonb;
  END IF;
END;
$$ LANGUAGE plpgsql; 