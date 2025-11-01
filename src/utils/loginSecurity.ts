/**
 * Login Security Utilities
 * Functions for tracking login attempts, account lockout, and brute force protection
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  RecordLoginAttemptParams,
  AccountLockoutStatus,
  LoginAttemptResult,
} from '@/types/security';
import { SECURITY_CONSTANTS } from '@/types/security';
import { logAudit } from './auditLogger';
import { AuditAction } from '@/types/security';

/**
 * Get client IP address (best effort)
 */
async function getClientIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return undefined;
  }
}

/**
 * Record a login attempt in the database
 */
export async function recordLoginAttempt(
  params: RecordLoginAttemptParams
): Promise<void> {
  try {
    const ipAddress = params.ipAddress || await getClientIP();
    const email = params.email.toLowerCase().trim();

    // If userId not provided but we have an email, look up the user
    let userId = params.userId;
    if (!userId && email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      userId = profile?.id;
    }

    await supabase.from('login_attempts').insert({
      user_id: userId,
      email: email,
      ip_address: ipAddress,
      user_agent: params.userAgent || navigator.userAgent,
      success: params.success,
      failure_reason: params.failureReason,
      timestamp: new Date().toISOString(),
    });

    // Update user security settings if failed
    if (!params.success && userId) {
      await incrementFailedLoginCount(userId);
    } else if (params.success && userId) {
      await resetFailedLoginCount(userId);
    }
  } catch (error) {
    console.error('Failed to record login attempt:', error);
  }
}

/**
 * Increment failed login count and check for lockout
 */
async function incrementFailedLoginCount(userId: string): Promise<void> {
  try {
    // Get current security settings
    const { data: settings } = await supabase
      .from('user_security_settings')
      .select('failed_login_count, account_locked')
      .eq('user_id', userId)
      .single();

    if (!settings) {
      // Create security settings if not exists
      await supabase.from('user_security_settings').insert({
        user_id: userId,
        failed_login_count: 1,
        last_failed_login: new Date().toISOString(),
      });
      return;
    }

    const newCount = (settings.failed_login_count || 0) + 1;

    // Check if account should be locked
    if (newCount >= SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS && !settings.account_locked) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + SECURITY_CONSTANTS.LOCKOUT_DURATION_MINUTES);

      await supabase
        .from('user_security_settings')
        .update({
          failed_login_count: newCount,
          account_locked: true,
          locked_until: lockedUntil.toISOString(),
          locked_reason: 'Too many failed login attempts',
          last_failed_login: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Log the lockout
      await logAudit({
        action: AuditAction.ACCOUNT_LOCKED,
        resourceType: 'user',
        resourceId: userId,
        metadata: {
          reason: 'Too many failed login attempts',
          failed_attempts: newCount,
          locked_until: lockedUntil.toISOString(),
        },
      });

      // Create security event (non-blocking)
      const { error: eventError } = await supabase.from('security_events').insert({
        event_type: 'brute_force',
        severity: 'high',
        user_id: userId,
        description: `Account locked after ${newCount} failed login attempts`,
        metadata: { failed_attempts: newCount },
      });

      if (eventError) {
        console.error('Failed to create security event:', eventError);
        // Don't throw - security event creation is not critical
      }
    } else {
      // Just increment count
      await supabase
        .from('user_security_settings')
        .update({
          failed_login_count: newCount,
          last_failed_login: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Failed to increment login count:', error);
  }
}

/**
 * Reset failed login count on successful login
 */
async function resetFailedLoginCount(userId: string): Promise<void> {
  try {
    await supabase
      .from('user_security_settings')
      .update({
        failed_login_count: 0,
        last_failed_login: null,
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Failed to reset login count:', error);
  }
}

/**
 * Check if an account is locked
 */
export async function checkAccountLockout(userId: string): Promise<AccountLockoutStatus> {
  try {
    const { data: settings } = await supabase
      .from('user_security_settings')
      .select('account_locked, locked_until, locked_reason, failed_login_count')
      .eq('user_id', userId)
      .single();

    if (!settings) {
      return {
        isLocked: false,
        canUnlock: false,
        attemptsRemaining: SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS,
      };
    }

    // Check if lockout has expired
    if (settings.account_locked && settings.locked_until) {
      const lockedUntil = new Date(settings.locked_until);
      if (lockedUntil <= new Date()) {
        // Lockout expired, unlock automatically
        await unlockAccount(userId, 'Lockout period expired');
        return {
          isLocked: false,
          canUnlock: false,
          attemptsRemaining: SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS,
        };
      }

      return {
        isLocked: true,
        lockedUntil,
        reason: settings.locked_reason || 'Account locked',
        canUnlock: true,
        attemptsRemaining: 0,
      };
    }

    if (settings.account_locked && !settings.locked_until) {
      // Permanently locked (requires admin)
      return {
        isLocked: true,
        reason: settings.locked_reason || 'Account locked by administrator',
        canUnlock: true,
        attemptsRemaining: 0,
      };
    }

    return {
      isLocked: false,
      canUnlock: false,
      attemptsRemaining: Math.max(
        0,
        SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS - (settings.failed_login_count || 0)
      ),
    };
  } catch (error) {
    console.error('Failed to check account lockout:', error);
    return {
      isLocked: false,
      canUnlock: false,
      attemptsRemaining: SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS,
    };
  }
}

/**
 * Unlock a user account (admin function)
 */
export async function unlockAccount(userId: string, reason?: string): Promise<void> {
  try {
    await supabase
      .from('user_security_settings')
      .update({
        account_locked: false,
        locked_until: null,
        locked_reason: null,
        failed_login_count: 0,
      })
      .eq('user_id', userId);

    // Log the unlock
    await logAudit({
      action: AuditAction.ACCOUNT_UNLOCKED,
      resourceType: 'user',
      resourceId: userId,
      metadata: { reason },
    });
  } catch (error) {
    console.error('Failed to unlock account:', error);
    throw error;
  }
}

/**
 * Lock a user account (admin function)
 */
export async function lockAccount(
  userId: string,
  reason: string,
  permanent: boolean = false
): Promise<void> {
  try {
    const lockedUntil = permanent
      ? null
      : new Date(Date.now() + SECURITY_CONSTANTS.LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();

    await supabase
      .from('user_security_settings')
      .update({
        account_locked: true,
        locked_until: lockedUntil,
        locked_reason: reason,
      })
      .eq('user_id', userId);

    // Log the lock
    await logAudit({
      action: AuditAction.ACCOUNT_LOCKED,
      resourceType: 'user',
      resourceId: userId,
      metadata: { reason, permanent, locked_until: lockedUntil },
    });

    // Create security event (non-blocking)
    const { error: eventError } = await supabase.from('security_events').insert({
      event_type: 'account_locked',
      severity: 'medium',
      user_id: userId,
      description: `Account locked by administrator: ${reason}`,
      metadata: { permanent },
    });

    if (eventError) {
      console.error('Failed to create security event:', eventError);
      // Don't throw - security event creation is not critical
    }
  } catch (error) {
    console.error('Failed to lock account:', error);
    throw error;
  }
}

/**
 * Get recent login attempts for a user
 */
export async function getRecentLoginAttempts(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get login attempts:', error);
    return [];
  }
}

/**
 * Detect suspicious login pattern
 */
export async function detectSuspiciousLogin(
  userId: string,
  currentIP?: string
): Promise<{ suspicious: boolean; reason?: string }> {
  try {
    // Get last successful login
    const { data: lastLogin } = await supabase
      .from('login_attempts')
      .select('ip_address, timestamp, geolocation')
      .eq('user_id', userId)
      .eq('success', true)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!lastLogin) {
      return { suspicious: false };
    }

    // Check for IP change
    if (currentIP && lastLogin.ip_address && currentIP !== lastLogin.ip_address) {
      // In a real implementation, check geolocation distance
      // If distance > threshold (e.g., 500km) in short time (e.g., 1 hour), flag as suspicious
      return {
        suspicious: true,
        reason: 'Login from new IP address',
      };
    }

    return { suspicious: false };
  } catch (error) {
    console.error('Failed to detect suspicious login:', error);
    return { suspicious: false };
  }
}

/**
 * Get failed login statistics
 */
export async function getFailedLoginStats(
  timeWindowHours: number = 24
): Promise<{
  totalAttempts: number;
  uniqueUsers: number;
  uniqueIPs: number;
}> {
  try {
    const since = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('login_attempts')
      .select('user_id, ip_address')
      .eq('success', false)
      .gte('timestamp', since);

    if (error) throw error;

    const uniqueUsers = new Set(data?.map(a => a.user_id).filter(Boolean)).size;
    const uniqueIPs = new Set(data?.map(a => a.ip_address).filter(Boolean)).size;

    return {
      totalAttempts: data?.length || 0,
      uniqueUsers,
      uniqueIPs,
    };
  } catch (error) {
    console.error('Failed to get failed login stats:', error);
    return {
      totalAttempts: 0,
      uniqueUsers: 0,
      uniqueIPs: 0,
    };
  }
}
