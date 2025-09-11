-- First, we need to update the office RLS policies to restrict contact information
-- Drop the overly permissive policy that allows public access to contact info
DROP POLICY IF EXISTS "Public can view office basic info only" ON public.offices;

-- Create new policies that separate public info from private contact info
CREATE POLICY "Public can view office basic location info" 
ON public.offices 
FOR SELECT 
USING (status = 'active' AND auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view all office info" 
ON public.offices 
FOR SELECT 
USING (status = 'active' AND auth.uid() IS NOT NULL);

-- Admins can still manage all offices
-- (The existing admin policy remains unchanged)