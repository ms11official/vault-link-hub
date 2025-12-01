-- Add parent_category_id to categories table for sub-categories support
ALTER TABLE categories ADD COLUMN parent_category_id uuid REFERENCES categories(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_categories_parent_category_id ON categories(parent_category_id);