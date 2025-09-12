-- Add featured column to events table
ALTER TABLE public.events ADD COLUMN featured boolean DEFAULT false NOT NULL;

-- Mark some existing events as featured for demonstration
UPDATE public.events SET featured = true WHERE title LIKE '%Future of AI%' OR title LIKE '%Digital Finance%' OR title LIKE '%Healthcare Innovation%' LIMIT 3;