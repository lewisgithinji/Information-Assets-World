-- ============================================================================
-- FIX: Admin Cannot See User Sessions and Users in Dashboard
-- ============================================================================
-- This script fixes the RLS policies that were preventing admins from viewing
-- sessions and user data. The issue was that the policies were using has_role()
-- which checks the user_roles table, but the app uses profiles.role column.
--
-- HOW TO APPLY THIS FIX:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- ============================================================================

-- Drop existing admin policies that use has_role()
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can update all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can delete all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all security settings" ON public.user_security_settings;
DROP POLICY IF EXISTS "Admins can manage all security settings" ON public.user_security_settings;
DROP POLICY IF EXISTS "Admins can view all security events" ON public.security_events;
DROP POLICY IF EXISTS "Admins can resolve security events" ON public.security_events;

-- ============================================================================
-- Recreate policies checking profiles.role directly
-- ============================================================================

-- user_sessions policies
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update all sessions"
ON public.user_sessions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete all sessions"
ON public.user_sessions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- login_attempts policies
CREATE POLICY "Admins can view all login attempts"
ON public.login_attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- audit_logs policies
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- user_security_settings policies
CREATE POLICY "Admins can view all security settings"
ON public.user_security_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage all security settings"
ON public.user_security_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- security_events policies
CREATE POLICY "Admins can view all security events"
ON public.security_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can resolve security events"
ON public.security_events FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this query after applying the fix to verify it's working:
--
-- SELECT COUNT(*) as total_sessions FROM public.user_sessions WHERE is_active = true;
-- SELECT COUNT(*) as total_users FROM public.profiles;
--
-- You should see the correct counts for your database.
-- ============================================================================
