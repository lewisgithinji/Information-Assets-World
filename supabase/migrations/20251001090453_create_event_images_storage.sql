-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Storage policies for event images
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Admins and editors can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' AND
  (SELECT get_user_role(auth.uid())) = ANY (ARRAY['admin'::text, 'editor'::text])
);

CREATE POLICY "Admins and editors can update event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images' AND
  (SELECT get_user_role(auth.uid())) = ANY (ARRAY['admin'::text, 'editor'::text])
);

CREATE POLICY "Admins and editors can delete event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' AND
  (SELECT get_user_role(auth.uid())) = ANY (ARRAY['admin'::text, 'editor'::text])
);

-- Create event_fees table
CREATE TABLE public.event_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  fee_type text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  description text,
  available_until date,
  max_quantity integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on event_fees
ALTER TABLE public.event_fees ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_fees
CREATE POLICY "Anyone can view fees for published events"
ON public.event_fees FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_fees.event_id
    AND events.status = 'published'
  )
);

CREATE POLICY "Admins and editors can view all event fees"
ON public.event_fees FOR SELECT
USING (
  (SELECT get_user_role(auth.uid())) = ANY (ARRAY['admin'::text, 'editor'::text])
);

CREATE POLICY "Admins and editors can manage event fees"
ON public.event_fees FOR ALL
USING (
  (SELECT get_user_role(auth.uid())) = ANY (ARRAY['admin'::text, 'editor'::text])
);

-- Add trigger for updated_at
CREATE TRIGGER update_event_fees_updated_at
BEFORE UPDATE ON public.event_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();