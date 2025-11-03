-- ============================================================================
-- DIAGNOSE SESSION INSERT ISSUE
-- ============================================================================
-- This will help us understand why session creation is failing
-- ============================================================================

-- 1. Check current table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_sessions'
ORDER BY ordinal_position;

-- 2. Check if table exists and has data
SELECT
  COUNT(*) as total_rows,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_sessions,
  COUNT(DISTINCT user_id) as unique_users
FROM public.user_sessions;

-- 3. Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_sessions';

-- 4. Try a manual test insert to see what happens
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from your profiles table
-- UNCOMMENT THE BLOCK BELOW AND REPLACE THE USER ID TO TEST:

/*
DO $$
DECLARE
  test_user_id UUID;
  new_session_id UUID;
BEGIN
  -- Get a real user ID from profiles table
  SELECT user_id INTO test_user_id
  FROM public.profiles
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in profiles table';
  END IF;

  RAISE NOTICE 'Testing with user_id: %', test_user_id;

  -- Try to insert a test session
  INSERT INTO public.user_sessions (
    user_id,
    device_info,
    ip_address,
    location,
    last_activity,
    expires_at,
    is_active
  ) VALUES (
    test_user_id,
    '{"browser": "Test", "os": "Test OS", "device": "Desktop"}'::jsonb,
    '127.0.0.1',
    '{"timezone": "UTC"}'::jsonb,
    now(),
    now() + interval '7 days',
    true
  )
  RETURNING id INTO new_session_id;

  RAISE NOTICE 'SUCCESS! Session created with id: %', new_session_id;

  -- Clean up test session
  DELETE FROM public.user_sessions WHERE id = new_session_id;
  RAISE NOTICE 'Test session cleaned up';

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR: %', SQLERRM;
  RAISE NOTICE 'DETAIL: %', SQLSTATE;
END $$;
*/

-- 5. Check if there are any constraints or triggers that might be causing issues
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_sessions'::regclass;

-- 6. Check for triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'user_sessions';

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Run this script in Supabase SQL Editor
-- 2. Check the results of all queries
-- 3. If you want to test the manual insert, uncomment the DO block and run again
-- 4. Share the results so we can identify the exact issue
-- ============================================================================
