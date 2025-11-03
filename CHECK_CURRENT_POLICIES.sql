-- ============================================================================
-- CHECK CURRENT NOTIFICATION POLICIES
-- ============================================================================
-- This will show us exactly what policies exist and help diagnose the issue
-- ============================================================================

-- 1. Show ALL current policies on notifications table
SELECT
  '=== ALL POLICIES ON NOTIFICATIONS TABLE ===' as info;

SELECT
  policyname as "Policy Name",
  cmd as "Operation",
  CASE cmd
    WHEN 'SELECT' THEN '👀 View'
    WHEN 'INSERT' THEN '➕ Create'
    WHEN 'UPDATE' THEN '✏️ Edit'
    WHEN 'DELETE' THEN '🗑️ Delete'
    WHEN 'ALL' THEN '🔓 All Operations'
  END as "Action",
  permissive as "Permissive",
  roles as "Roles",
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- 2. Count policies by operation type
SELECT
  '=== POLICY COUNT BY OPERATION ===' as info;

SELECT
  cmd as "Operation",
  COUNT(*) as "Count"
FROM pg_policies
WHERE tablename = 'notifications'
GROUP BY cmd
ORDER BY cmd;

-- 3. Check if there are UPDATE policies specifically
SELECT
  '=== UPDATE POLICIES DETAIL ===' as info;

SELECT
  policyname as "Policy Name",
  permissive as "Permissive",
  roles as "Roles"
FROM pg_policies
WHERE tablename = 'notifications'
AND cmd = 'UPDATE';

-- 4. Check your user info
SELECT
  '=== YOUR USER INFO ===' as info;

SELECT
  auth.uid() as "Your User ID",
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
    ELSE '✅ AUTHENTICATED'
  END as "Auth Status";

-- 5. Check your role
SELECT
  '=== YOUR ROLE ===' as info;

SELECT
  user_id as "User ID",
  email as "Email",
  role as "Role",
  CASE
    WHEN role = 'admin' THEN '✅ ADMIN'
    ELSE '👤 REGULAR USER'
  END as "Role Status"
FROM public.profiles
WHERE user_id = auth.uid();

-- 6. List your notifications
SELECT
  '=== YOUR NOTIFICATIONS (last 5) ===' as info;

SELECT
  id as "ID",
  title as "Title",
  is_read as "Read",
  created_at as "Created"
FROM public.notifications
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- 7. Try a simple manual update test
SELECT
  '=== MANUAL UPDATE TEST ===' as info;

DO $$
DECLARE
  test_id UUID;
  update_result INTEGER;
BEGIN
  -- Get first unread notification
  SELECT id INTO test_id
  FROM public.notifications
  WHERE user_id = auth.uid()
  AND is_read = false
  LIMIT 1;

  IF test_id IS NULL THEN
    RAISE NOTICE '⚠️ No unread notifications to test with';
    RETURN;
  END IF;

  RAISE NOTICE '📝 Testing update on notification: %', test_id;

  -- Try to update it
  UPDATE public.notifications
  SET is_read = true
  WHERE id = test_id
  AND user_id = auth.uid();

  GET DIAGNOSTICS update_result = ROW_COUNT;

  IF update_result > 0 THEN
    RAISE NOTICE '✅ SUCCESS - Updated % row(s)', update_result;
    RAISE NOTICE '   RLS policies are allowing updates!';

    -- Revert
    UPDATE public.notifications
    SET is_read = false
    WHERE id = test_id;

    RAISE NOTICE '   (Reverted change)';
  ELSE
    RAISE NOTICE '❌ FAILED - No rows were updated';
    RAISE NOTICE '   RLS policies are BLOCKING updates';
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERROR: %', SQLERRM;
  RAISE NOTICE '   Error Code: %', SQLSTATE;
END $$;

-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- After running this, check the Messages tab and share:
-- 1. How many UPDATE policies exist?
-- 2. What are their names?
-- 3. Did the manual update test succeed or fail?
-- 4. What's your role (admin or regular user)?
-- ============================================================================
