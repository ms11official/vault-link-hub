-- Add category_id column to items table to link items with custom categories
ALTER TABLE items ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;