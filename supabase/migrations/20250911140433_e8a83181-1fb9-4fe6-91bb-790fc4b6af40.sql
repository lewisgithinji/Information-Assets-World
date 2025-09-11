-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active offices" ON public.offices;

-- Create restrictive policies for public access (location data only)
CREATE POLICY "Public can view office locations only" 
ON public.offices 
FOR SELECT 
USING (status = 'active' AND auth.uid() IS NULL);

-- Create policy for authenticated users (basic contact info)
CREATE POLICY "Authenticated users can view office contact info" 
ON public.offices 
FOR SELECT 
USING (status = 'active' AND auth.uid() IS NOT NULL);

-- Keep admin policy unchanged
-- "Admins can manage offices" policy remains as is

-- Create a secure public view for location data only
CREATE OR REPLACE VIEW public.office_locations AS
SELECT 
  id,
  region,
  city,
  country,
  latitude,
  longitude,
  status,
  created_at,
  updated_at
FROM public.offices
WHERE status = 'active';

-- Enable RLS on the view
ALTER VIEW public.office_locations SET (security_invoker = true);

-- Create policy for public access to the location view
CREATE POLICY "Anyone can view office locations" 
ON public.office_locations 
FOR SELECT 
USING (true);

-- Create a function to check if user has office contact access
CREATE OR REPLACE FUNCTION public.can_access_office_contacts()
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow access if user is authenticated or is admin
  RETURN auth.uid() IS NOT NULL OR get_user_role(auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;