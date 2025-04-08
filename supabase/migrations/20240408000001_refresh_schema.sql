-- Add missing columns
ALTER TABLE festivals ADD COLUMN IF NOT EXISTS artists JSONB DEFAULT '[]'::jsonb;
ALTER TABLE festivals ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Set default values for existing rows
UPDATE festivals SET artists = '[]'::jsonb WHERE artists IS NULL;
UPDATE festivals SET is_favorite = false WHERE is_favorite IS NULL;

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema'; 