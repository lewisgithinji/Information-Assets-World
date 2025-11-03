-- Verification queries to check if the fix is working

-- 1. Check total active sessions
SELECT COUNT(*) as total_active_sessions
FROM public.user_sessions
WHERE is_active = true;

-- 2. Check total users/profiles
SELECT COUNT(*) as total_users
FROM public.profiles;

-- 3. List all active sessions with user info (what the admin dashboard should see)
SELECT
  s.id as session_id,
  s.user_id,
  p.email,
  p.full_name,
  p.role,
  s.created_at,
  s.last_activity,
  s.is_active
FROM public.user_sessions s
JOIN public.profiles p ON s.user_id = p.user_id
WHERE s.is_active = true
ORDER BY s.last_activity DESC;

-- 4. Check RLS policies on user_sessions table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_sessions'
  AND schemaname = 'public'
ORDER BY policyname;

-- 5. Verify your admin user has the 'admin' role in profiles
SELECT
  user_id,
  email,
  full_name,
  role
FROM public.profiles
WHERE role = 'admin';
