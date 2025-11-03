-- ============================================================================
-- CHECK NOTIFICATION PERMISSIONS
-- ============================================================================
-- Run this to diagnose the notification marking issue
-- ============================================================================

-- 1. Check if you're authenticated
SELECT
  auth.uid() as your_user_id,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
    ELSE '✅ AUTHENTICATED'
  END as auth_status;

-- 2. Check your role
SELECT
  user_id,
  email,
  role,
  CASE
    WHEN role = 'admin' THEN '✅ ADMIN'
    ELSE '👤 REGULAR USER'
  END as role_status
FROM public.profiles
WHERE user_id = auth.uid();

-- 3. Check your notifications
SELECT
  id,
  title,
  is_read,
  read_at,
  user_id,
  created_at,
  CASE
    WHEN user_id = auth.uid() THEN '✅ YOUR NOTIFICATION'
    ELSE '❌ NOT YOUR NOTIFICATION'
  END as ownership
FROM public.notifications
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check RLS policies on notifications table
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- 5. Try to manually update a notification (TEST)
-- This will show if RLS is blocking the update
DO $$
DECLARE
  test_notification_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION '❌ NOT AUTHENTICATED - You must be logged in';
  END IF;

  -- Get an unread notification ID
  SELECT id INTO test_notification_id
  FROM public.notifications
  WHERE user_id = current_user_id
  AND is_read = false
  LIMIT 1;

  IF test_notification_id IS NULL THEN
    RAISE NOTICE '⚠️ No unread notifications found for testing';
    RETURN;
  END IF;

  RAISE NOTICE '📝 Testing with notification ID: %', test_notification_id;
  RAISE NOTICE '👤 Current user ID: %', current_user_id;

  -- Try to update
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = test_notification_id
  AND user_id = current_user_id;

  -- Check if it worked
  IF FOUND THEN
    RAISE NOTICE '✅ SUCCESS! Notification was marked as read';
    RAISE NOTICE '   The RLS policies are working correctly';

    -- Revert the change
    UPDATE public.notifications
    SET is_read = false, read_at = NULL
    WHERE id = test_notification_id;

    RAISE NOTICE '   (Reverted the test change)';
  ELSE
    RAISE NOTICE '❌ FAILED! Could not update notification';
    RAISE NOTICE '   Check RLS policies';
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERROR: %', SQLERRM;
  RAISE NOTICE '   Code: %', SQLSTATE;
END $$;

-- 6. Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as rls_status
FROM pg_tables
WHERE tablename = 'notifications';

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Check the "Messages" tab for the test results
-- 3. Look for ✅ SUCCESS or ❌ FAILED messages
-- 4. Share the results if you still have issues
-- ============================================================================
