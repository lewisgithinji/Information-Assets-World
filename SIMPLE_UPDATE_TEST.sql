-- ============================================================================
-- SIMPLE NOTIFICATION UPDATE TEST
-- ============================================================================
-- This will test if you can update notifications, step by step
-- ============================================================================

-- Step 1: Check authentication
SELECT
  '=== STEP 1: AUTHENTICATION ===' as step,
  auth.uid() as user_id,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED - You need to be logged in!'
    ELSE '✅ AUTHENTICATED'
  END as status;

-- Step 2: Show your notifications
SELECT
  '=== STEP 2: YOUR NOTIFICATIONS ===' as step,
  id,
  title,
  is_read,
  created_at
FROM public.notifications
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Count unread notifications
SELECT
  '=== STEP 3: UNREAD COUNT ===' as step,
  COUNT(*) as unread_count
FROM public.notifications
WHERE user_id = auth.uid()
AND is_read = false;

-- Step 4: Show UPDATE policies
SELECT
  '=== STEP 4: UPDATE POLICIES ===' as step,
  policyname,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'notifications'
AND cmd = 'UPDATE';

-- Step 5: Try to update a specific notification (REPLACE THE ID BELOW!)
-- INSTRUCTIONS:
-- 1. Look at the results from Step 2 above
-- 2. Copy one of the notification IDs
-- 3. Replace 'YOUR-NOTIFICATION-ID-HERE' below with the actual ID
-- 4. Uncomment the UPDATE statement (remove the -- at the start)
-- 5. Run the script again

/*
UPDATE public.notifications
SET is_read = true, read_at = now()
WHERE id = 'YOUR-NOTIFICATION-ID-HERE'::uuid
AND user_id = auth.uid()
RETURNING id, is_read, read_at;
*/

-- ============================================================================
-- ALTERNATIVE: If you want to test with ANY unread notification
-- ============================================================================
-- Uncomment this block to automatically test with your first unread notification:

/*
WITH first_unread AS (
  SELECT id
  FROM public.notifications
  WHERE user_id = auth.uid()
  AND is_read = false
  LIMIT 1
)
UPDATE public.notifications
SET is_read = true, read_at = now()
WHERE id IN (SELECT id FROM first_unread)
RETURNING
  '✅ SUCCESS! Updated notification:' as result,
  id,
  is_read,
  read_at;
*/

-- ============================================================================
-- IF YOU GET AN ERROR, IT WILL SHOW:
-- - Error code (like 42501 for permission denied)
-- - Error message (explaining what went wrong)
-- ============================================================================
