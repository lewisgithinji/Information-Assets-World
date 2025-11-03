-- ============================================================================
-- FIX NOTIFICATIONS RLS POLICIES
-- ============================================================================
-- This fixes the 400 error when marking notifications as read
-- ============================================================================

-- First, check current policies
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'notifications';

-- Enable RLS if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create comprehensive RLS policies

-- 1. Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Users can update their own notifications (for marking as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. System can insert notifications for users
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check policies were created
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

-- Test if you can update your own notifications
-- Replace YOUR_USER_ID with your actual user_id from auth.users
/*
SELECT auth.uid(); -- Get your user ID

-- Try to update a notification
UPDATE public.notifications
SET is_read = true, read_at = now()
WHERE user_id = auth.uid()
AND id = (
  SELECT id FROM public.notifications
  WHERE user_id = auth.uid()
  LIMIT 1
);

-- Check if it worked
SELECT id, is_read, read_at
FROM public.notifications
WHERE user_id = auth.uid()
LIMIT 5;
*/

-- ============================================================================
-- SUCCESS!
-- RLS policies have been fixed for notifications table
-- You should now be able to mark notifications as read
-- ============================================================================
