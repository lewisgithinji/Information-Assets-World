-- ============================================================================
-- FIX NOTIFICATIONS RLS POLICIES - VERSION 2
-- ============================================================================
-- This version forcefully drops ALL existing policies before recreating them
-- Fixes the "policy already exists" error (42710)
-- ============================================================================

-- Step 1: Show current policies before changes
SELECT
  '=== CURRENT POLICIES BEFORE FIX ===' as step,
  policyname,
  cmd as operation,
  permissive
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- Step 2: Forcefully drop ALL existing policies
DO $$
DECLARE
  r RECORD;
  drop_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== DROPPING ALL EXISTING POLICIES ===';

  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'notifications'
    AND schemaname = 'public'
  )
  LOOP
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.notifications';
      drop_count := drop_count + 1;
      RAISE NOTICE '✅ Dropped policy: %', r.policyname;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Failed to drop policy %: %', r.policyname, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '=== TOTAL POLICIES DROPPED: % ===', drop_count;
END $$;

-- Step 3: Verify all policies are dropped
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ ALL POLICIES SUCCESSFULLY DROPPED'
    ELSE '⚠️ WARNING: ' || COUNT(*) || ' POLICIES STILL EXIST'
  END as status,
  COUNT(*) as remaining_policies
FROM pg_policies
WHERE tablename = 'notifications';

-- Step 4: Enable RLS if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 5: Create fresh RLS policies
DO $$
BEGIN
  RAISE NOTICE '=== CREATING NEW POLICIES ===';

  -- 1. Users can view their own notifications
  CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
  RAISE NOTICE '✅ Created: Users can view own notifications';

  -- 2. Users can update their own notifications (for marking as read)
  CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  RAISE NOTICE '✅ Created: Users can update own notifications';

  -- 3. Users can delete their own notifications
  CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
  RAISE NOTICE '✅ Created: Users can delete own notifications';

  -- 4. System can insert notifications for users
  CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
  RAISE NOTICE '✅ Created: System can insert notifications';

  -- 5. Admins can view all notifications
  CREATE POLICY "Admins can view all notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
  RAISE NOTICE '✅ Created: Admins can view all notifications';

  -- 6. Admins can update any notification
  CREATE POLICY "Admins can update all notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
  RAISE NOTICE '✅ Created: Admins can update all notifications';

  RAISE NOTICE '=== ALL POLICIES CREATED SUCCESSFULLY ===';
END $$;

-- Step 6: Verify new policies were created
SELECT
  '=== NEW POLICIES AFTER FIX ===' as step,
  policyname,
  cmd as operation,
  permissive,
  CASE cmd
    WHEN 'SELECT' THEN '👀 View'
    WHEN 'INSERT' THEN '➕ Create'
    WHEN 'UPDATE' THEN '✏️ Edit'
    WHEN 'DELETE' THEN '🗑️ Delete'
  END as action
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- Step 7: Test if you can update your own notifications
DO $$
DECLARE
  test_notification_id UUID;
  current_user_id UUID;
  test_successful BOOLEAN := false;
BEGIN
  RAISE NOTICE '=== TESTING UPDATE PERMISSIONS ===';

  -- Get current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE NOTICE '❌ NOT AUTHENTICATED - You must be logged in to test';
    RETURN;
  END IF;

  RAISE NOTICE '👤 Current user ID: %', current_user_id;

  -- Get an unread notification ID
  SELECT id INTO test_notification_id
  FROM public.notifications
  WHERE user_id = current_user_id
  AND is_read = false
  LIMIT 1;

  IF test_notification_id IS NULL THEN
    RAISE NOTICE '⚠️ No unread notifications found for testing';
    RAISE NOTICE '   Creating a test notification...';

    -- Create a test notification
    INSERT INTO public.notifications (user_id, type, title, message, is_read)
    VALUES (
      current_user_id,
      'upcoming_followup',
      'Test Notification',
      'This is a test notification for RLS testing',
      false
    )
    RETURNING id INTO test_notification_id;

    RAISE NOTICE '✅ Created test notification: %', test_notification_id;
  END IF;

  RAISE NOTICE '📝 Testing with notification ID: %', test_notification_id;

  -- Try to update
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = test_notification_id
  AND user_id = current_user_id;

  -- Check if it worked
  IF FOUND THEN
    test_successful := true;
    RAISE NOTICE '✅ SUCCESS! Notification was marked as read';
    RAISE NOTICE '   The RLS policies are working correctly';

    -- Revert the change
    UPDATE public.notifications
    SET is_read = false, read_at = NULL
    WHERE id = test_notification_id;

    RAISE NOTICE '   (Reverted the test change)';
  ELSE
    RAISE NOTICE '❌ FAILED! Could not update notification';
    RAISE NOTICE '   The RLS policies may still be blocking updates';
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERROR DURING TEST: %', SQLERRM;
  RAISE NOTICE '   Error Code: %', SQLSTATE;
  RAISE NOTICE '   This indicates a problem with the RLS policies';
END $$;

-- Step 8: Check RLS status
SELECT
  '=== RLS STATUS ===' as step,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity THEN '✅ RLS IS ENABLED'
    ELSE '❌ RLS IS DISABLED - THIS IS A PROBLEM!'
  END as rls_status
FROM pg_tables
WHERE tablename = 'notifications';

-- Step 9: Final summary
DO $$
DECLARE
  policy_count INTEGER;
  rls_enabled BOOLEAN;
BEGIN
  RAISE NOTICE '=== FINAL SUMMARY ===';

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'notifications';

  RAISE NOTICE 'Total policies created: %', policy_count;

  IF policy_count = 6 THEN
    RAISE NOTICE '✅ All 6 policies are in place';
  ELSE
    RAISE NOTICE '⚠️ Expected 6 policies, found %', policy_count;
  END IF;

  -- Check RLS
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE tablename = 'notifications';

  IF rls_enabled THEN
    RAISE NOTICE '✅ RLS is enabled';
  ELSE
    RAISE NOTICE '❌ RLS is NOT enabled';
  END IF;

  RAISE NOTICE '=== FIX COMPLETE ===';
  RAISE NOTICE 'Next step: Test marking notifications as read in your app';
END $$;

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 1. Copy this entire script
-- 2. Go to Supabase SQL Editor:
--    https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/sql
-- 3. Click "New Query"
-- 4. Paste this script
-- 5. Click "Run"
-- 6. Check the "Messages" tab for detailed results
-- 7. You should see:
--    - ✅ ALL POLICIES SUCCESSFULLY DROPPED
--    - ✅ Created: [6 policy names]
--    - ✅ SUCCESS! Notification was marked as read
--    - ✅ All 6 policies are in place
--    - ✅ RLS is enabled
-- 8. If you see ✅ SUCCESS in the test, refresh your app and try again!
-- ============================================================================
