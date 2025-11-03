-- ============================================================================
-- UPDATE USER_SESSIONS TABLE - Add Missing Columns
-- ============================================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your project: gppohyyuggnfecfabcyz
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Click "New Query"
-- 5. Copy and paste this entire file
-- 6. Click "Run" button
-- ============================================================================

-- First, let's check what columns currently exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_sessions'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist

-- Add device_info column (stores browser, OS, device type)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_sessions'
      AND column_name = 'device_info'
  ) THEN
    ALTER TABLE public.user_sessions
    ADD COLUMN device_info JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added column: device_info';
  ELSE
    RAISE NOTICE 'Column device_info already exists';
  END IF;
END $$;

-- Add ip_address column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_sessions'
      AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE public.user_sessions
    ADD COLUMN ip_address TEXT;
    RAISE NOTICE 'Added column: ip_address';
  ELSE
    RAISE NOTICE 'Column ip_address already exists';
  END IF;
END $$;

-- Add location column (stores city, country, timezone)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_sessions'
      AND column_name = 'location'
  ) THEN
    ALTER TABLE public.user_sessions
    ADD COLUMN location JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added column: location';
  ELSE
    RAISE NOTICE 'Column location already exists';
  END IF;
END $$;

-- Add last_activity column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_sessions'
      AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE public.user_sessions
    ADD COLUMN last_activity TIMESTAMPTZ NOT NULL DEFAULT now();
    RAISE NOTICE 'Added column: last_activity';
  ELSE
    RAISE NOTICE 'Column last_activity already exists';
  END IF;
END $$;

-- Add expires_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_sessions'
      AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE public.user_sessions
    ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days');
    RAISE NOTICE 'Added column: expires_at';
  ELSE
    RAISE NOTICE 'Column expires_at already exists';
  END IF;
END $$;

-- Add is_active column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_sessions'
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.user_sessions
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    RAISE NOTICE 'Added column: is_active';
  ELSE
    RAISE NOTICE 'Column is_active already exists';
  END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity DESC);

-- Ensure RLS is enabled
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can update all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can delete all sessions" ON public.user_sessions;

-- Create RLS Policies

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own sessions (for login tracking)
CREATE POLICY "Users can create own sessions"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions (for activity tracking)
CREATE POLICY "Users can update own sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own sessions (for logout)
CREATE POLICY "Users can delete own sessions"
ON public.user_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update any session (for termination)
CREATE POLICY "Admins can update all sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can delete any session
CREATE POLICY "Admins can delete all sessions"
ON public.user_sessions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create helper functions

-- Function to automatically clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_sessions
  SET is_active = false
  WHERE is_active = true
    AND expires_at < now();
END;
$$;

-- Grant execute permission on the cleanup function
GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions() TO authenticated;

-- Create a trigger to update last_activity timestamp
CREATE OR REPLACE FUNCTION public.update_session_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$;

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS trigger_update_session_activity ON public.user_sessions;

CREATE TRIGGER trigger_update_session_activity
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_session_activity();

-- ============================================================================
-- VERIFICATION - Check the updated table structure
-- ============================================================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_sessions'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'user_sessions'
ORDER BY indexname;

-- Check RLS policies
SELECT policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'user_sessions'
ORDER BY policyname;

-- ============================================================================
-- SUCCESS!
-- All required columns have been added to the user_sessions table.
-- You can now use the Session Management feature!
-- ============================================================================
