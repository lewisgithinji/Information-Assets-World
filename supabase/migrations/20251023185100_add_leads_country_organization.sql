-- Drop the existing restrictive INSERT policy for leads
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.leads;

-- Create a new policy that allows anyone (including anonymous users) to insert leads
CREATE POLICY "Anyone can create leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Note: This is safe because:
-- 1. The leads table doesn't contain sensitive user data initially
-- 2. This is a contact form meant for public submissions
-- 3. Other policies still protect UPDATE/DELETE operations