-- Migration: Fix User Security Settings RLS Policies
-- Created: 2025-10-31
-- Description: Add INSERT policy to allow system to create user_security_settings records

-- Add policy to allow system to insert user_security_settings for the authenticated user
CREATE POLICY "System can create user security settings"
    ON public.user_security_settings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Comment explaining the policy
COMMENT ON POLICY "System can create user security settings" ON public.user_security_settings IS
'Allows the system to create security settings records for users when they first attempt login. This is needed because the auto-trigger may not have run if the user was created before the trigger was installed.';
