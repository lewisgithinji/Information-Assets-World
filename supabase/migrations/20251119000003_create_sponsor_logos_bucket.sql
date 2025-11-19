-- Create storage bucket for sponsor/partner/client logos
-- Migration: 20251119000003_create_sponsor_logos_bucket.sql

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the bucket

-- Allow public read access to all logos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'sponsor-logos' );

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'sponsor-logos' );

-- Allow authenticated users to update their uploaded logos
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'sponsor-logos' );

-- Allow authenticated users to delete logos
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'sponsor-logos' );
