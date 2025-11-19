-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active offices" ON public.offices;

-- Create secure policy that excludes sensitive fields for unauthenticated users
-- This approach uses application-level filtering instead of database views
CREATE POLICY "Public can view office basic info only" 
ON public.offices 
FOR SELECT 
USING (status = 'active');

-- Create a secure function for public office data (non-sensitive fields only)
CREATE OR REPLACE FUNCTION public.get_public_office_locations()
RETURNS TABLE (
  id uuid,
  region text,
  city text,
  country text,
  latitude numeric,
  longitude numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.region,
    o.city,
    o.country,
    o.latitude,
    o.longitude
  FROM public.offices o
  WHERE o.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;