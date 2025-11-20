-- Add order column to items table for drag and drop sorting
ALTER TABLE items ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- Create index for better performance when sorting
CREATE INDEX IF NOT EXISTS idx_items_order ON items("order", created_at);