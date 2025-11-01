-- Migration: Create Security Tables for Enhanced Security Center
-- Created: 2025-10-31
-- Description: Adds tables for login tracking, audit logging, sessions, and user security settings

-- ============================================================================
-- Table: login_attempts
-- Purpose: Track all login attempts (successful and failed) for security monitoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    failure_reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    geolocation JSONB -- {country, city, latitude, longitude}
);

-- Indexes for login_attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_timestamp ON public.login_attempts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON public.login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON public.login_attempts(success, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address, timestamp DESC);

-- ============================================================================
-- Table: audit_logs
-- Purpose: Track all administrative and security-relevant user actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'user.role.updated', 'user.deleted', 'password.reset'
    resource_type TEXT NOT NULL, -- e.g., 'user', 'role', 'lead', 'system'
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB, -- Additional context
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- ============================================================================
-- Table: user_sessions
-- Purpose: Track active user sessions for session management
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB, -- {device_type, os, browser}
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);

-- ============================================================================
-- Table: password_reset_tokens
-- Purpose: Manage password reset tokens securely
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT
);

-- Indexes for password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON public.password_reset_tokens(expires_at);

-- ============================================================================
-- Table: user_security_settings
-- Purpose: Per-user security configuration and tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Password policy
    force_password_change BOOLEAN DEFAULT false,
    last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    password_history JSONB DEFAULT '[]'::jsonb, -- Array of {hash, changed_at}

    -- Account lockout
    account_locked BOOLEAN DEFAULT false,
    locked_until TIMESTAMP WITH TIME ZONE,
    locked_reason TEXT,
    failed_login_count INTEGER DEFAULT 0,
    last_failed_login TIMESTAMP WITH TIME ZONE,

    -- Two-factor authentication
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT, -- TOTP secret (should be encrypted in production)
    backup_codes JSONB, -- Array of backup codes
    two_factor_verified BOOLEAN DEFAULT false,

    -- Session settings
    session_timeout_minutes INTEGER DEFAULT 30,
    require_reauth_for_sensitive BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user_security_settings
CREATE INDEX IF NOT EXISTS idx_user_security_user_id ON public.user_security_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_locked ON public.user_security_settings(account_locked, locked_until);

-- ============================================================================
-- Table: security_events
-- Purpose: Track security-related events for alerting and monitoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'suspicious_login', 'brute_force', 'account_takeover', etc.
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    metadata JSONB,
    ip_address TEXT,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for security_events
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON public.security_events(resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all security tables
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- login_attempts policies
CREATE POLICY "Admins can view all login attempts"
    ON public.login_attempts FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own login attempts"
    ON public.login_attempts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert login attempts"
    ON public.login_attempts FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- audit_logs policies
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- user_sessions policies
CREATE POLICY "Admins can view all sessions"
    ON public.user_sessions FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own sessions"
    ON public.user_sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions"
    ON public.user_sessions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- password_reset_tokens policies
CREATE POLICY "Users can view own reset tokens"
    ON public.password_reset_tokens FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage reset tokens"
    ON public.password_reset_tokens FOR ALL
    TO authenticated
    WITH CHECK (true);

-- user_security_settings policies
CREATE POLICY "Admins can view all security settings"
    ON public.user_security_settings FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own security settings"
    ON public.user_security_settings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all security settings"
    ON public.user_security_settings FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own security settings"
    ON public.user_security_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- security_events policies
CREATE POLICY "Admins can view all security events"
    ON public.security_events FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create security events"
    ON public.security_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can resolve security events"
    ON public.security_events FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- Functions
-- ============================================================================

-- Function: Auto-create user_security_settings on new user
CREATE OR REPLACE FUNCTION public.create_user_security_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_security_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger: Create security settings on new user in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_security ON auth.users;
CREATE TRIGGER on_auth_user_created_security
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_security_settings();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger: Auto-update updated_at on user_security_settings
DROP TRIGGER IF EXISTS update_user_security_settings_updated_at ON public.user_security_settings;
CREATE TRIGGER update_user_security_settings_updated_at
    BEFORE UPDATE ON public.user_security_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_sessions
    SET is_active = false
    WHERE expires_at < NOW() AND is_active = true;
END;
$$;

-- Function: Clean up expired password reset tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.password_reset_tokens
    WHERE expires_at < NOW() AND used = false;
END;
$$;

-- Function: Check and unlock accounts after lockout period
CREATE OR REPLACE FUNCTION public.unlock_expired_lockouts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_security_settings
    SET
        account_locked = false,
        locked_until = NULL,
        failed_login_count = 0,
        locked_reason = NULL
    WHERE
        account_locked = true
        AND locked_until IS NOT NULL
        AND locked_until < NOW();
END;
$$;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.login_attempts IS 'Tracks all login attempts for security monitoring and brute force detection';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail of all administrative and security actions';
COMMENT ON TABLE public.user_sessions IS 'Active session management for users';
COMMENT ON TABLE public.password_reset_tokens IS 'Secure password reset token management';
COMMENT ON TABLE public.user_security_settings IS 'Per-user security configuration including 2FA, lockout, and password policies';
COMMENT ON TABLE public.security_events IS 'Security events requiring attention or investigation';

-- ============================================================================
-- Grant permissions
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant access to tables for authenticated users (RLS will control actual access)
GRANT SELECT, INSERT ON public.login_attempts TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.password_reset_tokens TO authenticated;
GRANT ALL ON public.user_security_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.security_events TO authenticated;
