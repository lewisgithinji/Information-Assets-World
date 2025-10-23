-- Add email verification fields to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP WITH TIME ZONE;

-- Create table for rate limiting lead submissions by IP
CREATE TABLE IF NOT EXISTS public.lead_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE
);

-- Enable RLS on lead_submissions
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for lead_submissions (admin read only)
CREATE POLICY "Admins can view lead submissions"
ON public.lead_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index for faster rate limiting queries
CREATE INDEX IF NOT EXISTS idx_lead_submissions_ip_time 
ON public.lead_submissions(ip_address, submitted_at DESC);

-- Add index for verification token lookups
CREATE INDEX IF NOT EXISTS idx_leads_verification_token 
ON public.leads(verification_token) WHERE verification_token IS NOT NULL;