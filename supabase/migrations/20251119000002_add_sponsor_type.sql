-- Add type field to sponsors table to differentiate between sponsors, partners, and clients
-- Migration: 20251119000002_add_sponsor_type.sql

-- Add type column to sponsors table
ALTER TABLE public.sponsors
ADD COLUMN type TEXT DEFAULT 'sponsor' CHECK (type IN ('sponsor', 'partner', 'client'));

-- Add comment to explain the field
COMMENT ON COLUMN public.sponsors.type IS 'Type of organization: sponsor, partner, or client';

-- Create index for filtering by type
CREATE INDEX idx_sponsors_type ON public.sponsors(type);

-- Update existing records to have a default type (optional)
-- You can manually update these later based on your needs
UPDATE public.sponsors
SET type = 'sponsor'
WHERE type IS NULL;
