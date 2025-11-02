-- Add order tracking fields to materials table
-- Run this in your Supabase SQL editor

-- Add the new columns to the materials table
ALTER TABLE materials 
ADD COLUMN is_ordered BOOLEAN DEFAULT FALSE,
ADD COLUMN order_number VARCHAR(100);

-- Add an index for better performance when filtering by order status
CREATE INDEX idx_materials_is_ordered ON materials(is_ordered);

-- Update any existing materials to have default values
UPDATE materials 
SET is_ordered = FALSE, order_number = '' 
WHERE is_ordered IS NULL OR order_number IS NULL;

