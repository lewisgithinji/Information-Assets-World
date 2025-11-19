-- Migration to automatically unfeature past events
-- This ensures that events which have ended are not displayed in the featured section

-- First, manually unfeature all past events
UPDATE public.events
SET featured = false
WHERE end_date < CURRENT_DATE
  AND featured = true;

-- Create a function to automatically unfeature past events
CREATE OR REPLACE FUNCTION auto_unfeature_past_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events
  SET featured = false
  WHERE end_date < CURRENT_DATE
    AND featured = true;
END;
$$;

-- Create a scheduled job to run daily (requires pg_cron extension)
-- Note: This requires the pg_cron extension to be enabled
-- If pg_cron is not available, you can call this function manually or via a cron job

-- Grant execute permission to authenticated users (for manual execution if needed)
GRANT EXECUTE ON FUNCTION auto_unfeature_past_events() TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION auto_unfeature_past_events() IS
'Automatically unfeatures events that have ended (end_date < current_date).
This function should be run daily via pg_cron or called manually.';
