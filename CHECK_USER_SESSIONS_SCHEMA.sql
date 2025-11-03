-- ============================================================================
-- CHECK USER_SESSIONS TABLE SCHEMA
-- ============================================================================
-- Run this to see what columns actually exist in your user_sessions table
-- ============================================================================

-- 1. Check all columns in user_sessions table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_sessions'
ORDER BY ordinal_position;

-- 2. Check if user_sessions table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_sessions'
) as table_exists;

-- 3. Try to insert a test row to see what error we get
-- (This will show us what columns are missing)
-- UNCOMMENT BELOW TO TEST:

/*
INSERT INTO public.user_sessions (
  user_id,
  device_info,
  ip_address,
  location,
  created_at,
  last_activity,
  expires_at,
  is_active
) VALUES (
  auth.uid(),
  '{"browser": "Chrome", "os": "Windows 11", "device": "Desktop"}'::jsonb,
  '192.168.1.100',
  '{"timezone": "Africa/Nairobi"}'::jsonb,
  now(),
  now(),
  now() + interval '7 days',
  true
);
*/
