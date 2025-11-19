-- Add featured column to events table
ALTER TABLE public.events ADD COLUMN featured boolean DEFAULT false NOT NULL;

-- Mark some existing events as featured for demonstration (using subquery approach)
UPDATE public.events SET featured = true 
WHERE id IN (
  SELECT id FROM public.events 
  WHERE title ILIKE '%Future of AI%' OR title ILIKE '%Digital Finance%' OR title ILIKE '%Healthcare Innovation%'
  ORDER BY created_at ASC
  LIMIT 3
);