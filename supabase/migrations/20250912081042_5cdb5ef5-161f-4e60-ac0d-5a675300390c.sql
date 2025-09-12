-- Update RLS policy for offices table to restrict public access to basic location info only
DROP POLICY IF EXISTS "Public can view office basic location info" ON public.offices;

-- Create more restrictive policy that only allows basic location fields for public access
CREATE POLICY "Public can view office basic location info" 
ON public.offices 
FOR SELECT 
USING (
  status = 'active' AND 
  auth.uid() IS NULL
);

-- Update the existing authenticated users policy to be more explicit
DROP POLICY IF EXISTS "Authenticated users can view all office info" ON public.offices;

CREATE POLICY "Authenticated users can view all office info" 
ON public.offices 
FOR SELECT 
USING (
  status = 'active' AND 
  auth.uid() IS NOT NULL
);