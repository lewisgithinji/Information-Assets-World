/**
 * User Management Utilities
 * Functions for managing users, roles, and account status
 */

import { supabase } from '@/integrations/supabase/client';
import { logAudit } from './auditLogger';
import { AuditAction } from '@/types/security';
import { lockAccount, unlockAccount } from './loginSecurity';

export type UserRole = 'admin' | 'editor' | 'user';

/**
 * Ensure user has security settings record
 */
async function ensureUserSecuritySettings(userId: string): Promise<void> {
  try {
    // Check if security settings exist
    const { data: existing, error: checkError } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when not found

    if (checkError) {
      console.error('Error checking security settings:', checkError);
      return;
    }

    if (!existing) {
      // Create security settings if they don't exist
      console.log(`Creating security settings for user ${userId}`);
      const { error: insertError } = await supabase
        .from('user_security_settings')
        .insert({
          user_id: userId,
          account_locked: false,
          failed_login_count: 0,
          two_factor_enabled: false,
        });

      if (insertError) {
        // Check if it's a duplicate key error (409)
        if (insertError.code === '23505') {
          console.log(`Security settings already exist for user ${userId} (created by another process)`);
        } else {
          console.error('Failed to create security settings:', insertError);
        }
      } else {
        console.log(`Successfully created security settings for user ${userId}`);
      }
    } else {
      console.log(`Security settings already exist for user ${userId}`);
    }
  } catch (error) {
    console.error('Error ensuring security settings:', error);
  }
}

export interface UserProfile {
  id: string;
  user_id: string; // auth.users.id - needed for security operations
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
}

export interface UserWithSecurity extends UserProfile {
  account_locked: boolean;
  locked_until: string | null;
  locked_reason: string | null;
  failed_login_count: number;
  last_login?: string | null;
  two_factor_enabled: boolean;
}

/**
 * Get all users with their security settings
 */
export async function getAllUsers(): Promise<UserWithSecurity[]> {
  try {
    // Fetch profiles with security settings
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found');
      return [];
    }

    console.log(`Found ${profiles.length} profiles`);

    // Get user IDs (from auth.users, not profiles.id)
    const userIds = profiles.map(p => p.user_id);

    // Fetch security settings for all users
    const { data: securitySettings, error: securityError } = await supabase
      .from('user_security_settings')
      .select('user_id, account_locked, locked_until, locked_reason, failed_login_count, two_factor_enabled')
      .in('user_id', userIds);

    if (securityError) {
      console.error('Error fetching security settings:', securityError);
      // Don't throw, continue with empty security settings
    }

    console.log(`Found ${securitySettings?.length || 0} security settings`);

    // Fetch last login for all users
    const { data: lastLogins, error: loginError } = await supabase
      .from('login_attempts')
      .select('user_id, timestamp')
      .in('user_id', userIds)
      .eq('success', true)
      .order('timestamp', { ascending: false });

    if (loginError) {
      console.error('Error fetching login attempts:', loginError);
      // Don't throw, continue without login data
    }

    console.log(`Found ${lastLogins?.length || 0} login attempts`);

    // Create maps for quick lookup
    const securityMap = new Map(
      securitySettings?.map(s => [s.user_id, s]) || []
    );

    const lastLoginMap = new Map<string, string>();
    lastLogins?.forEach(login => {
      if (!lastLoginMap.has(login.user_id)) {
        lastLoginMap.set(login.user_id, login.timestamp);
      }
    });

    // Combine data
    const users: UserWithSecurity[] = profiles.map(profile => {
      const security = securityMap.get(profile.user_id);
      const lastLogin = lastLoginMap.get(profile.user_id);

      const user = {
        ...profile,
        account_locked: security?.account_locked || false,
        locked_until: security?.locked_until || null,
        locked_reason: security?.locked_reason || null,
        failed_login_count: security?.failed_login_count || 0,
        last_login: lastLogin || null,
        two_factor_enabled: security?.two_factor_enabled || false,
      };

      console.log(`User ${profile.email}:`, {
        locked: user.account_locked,
        failed: user.failed_login_count,
        lastLogin: user.last_login
      });

      return user;
    });

    return users;
  } catch (error) {
    console.error('Failed to get all users:', error);
    throw error;
  }
}

/**
 * Update user role
 * @param profileId - profiles.id (NOT auth.users.id)
 */
export async function updateUserRole(
  profileId: string,
  newRole: UserRole,
  oldRole?: UserRole
): Promise<void> {
  try {
    console.log(`Updating role for profile ${profileId} from ${oldRole} to ${newRole}`);

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select();

    if (error) {
      console.error('Update error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Update successful:', data);

    // Log the role change
    await logAudit({
      action: AuditAction.USER_ROLE_UPDATED,
      resourceType: 'user',
      resourceId: profileId,
      oldValue: { role: oldRole },
      newValue: { role: newRole },
      metadata: {
        changed_at: new Date().toISOString(),
      },
    });

    console.log(`Successfully updated role for profile ${profileId}`);
  } catch (error) {
    console.error('Failed to update user role:', error);
    throw error;
  }
}

/**
 * Lock user account (admin action)
 * @param userId - auth.users.id (NOT profiles.id)
 */
export async function lockUserAccount(
  userId: string,
  reason: string,
  permanent: boolean = false
): Promise<void> {
  try {
    console.log(`Locking account for user ${userId}, permanent: ${permanent}, reason: ${reason}`);

    // Ensure security settings exist
    await ensureUserSecuritySettings(userId);

    // Lock the account
    await lockAccount(userId, reason, permanent);

    console.log(`Successfully locked account for user ${userId}`);
  } catch (error) {
    console.error('Failed to lock user account:', error);
    throw error;
  }
}

/**
 * Unlock user account (admin action)
 * @param userId - auth.users.id (NOT profiles.id)
 */
export async function unlockUserAccount(
  userId: string,
  reason?: string
): Promise<void> {
  try {
    console.log(`Unlocking account for user ${userId}`);

    // Ensure security settings exist
    await ensureUserSecuritySettings(userId);

    // Unlock the account
    await unlockAccount(userId, reason);

    console.log(`Successfully unlocked account for user ${userId}`);
  } catch (error) {
    console.error('Failed to unlock user account:', error);
    throw error;
  }
}

/**
 * Get user details with full security information
 * @param userId - auth.users.id (not profiles.id)
 */
export async function getUserDetails(userId: string): Promise<UserWithSecurity | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) return null;

    const { data: security } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: lastLogin } = await supabase
      .from('login_attempts')
      .select('timestamp')
      .eq('user_id', userId)
      .eq('success', true)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    return {
      ...profile,
      account_locked: security?.account_locked || false,
      locked_until: security?.locked_until || null,
      locked_reason: security?.locked_reason || null,
      failed_login_count: security?.failed_login_count || 0,
      last_login: lastLogin?.timestamp || null,
      two_factor_enabled: security?.two_factor_enabled || false,
    };
  } catch (error) {
    console.error('Failed to get user details:', error);
    return null;
  }
}

/**
 * Get user's recent activity
 */
export async function getUserActivity(userId: string, limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .or(`actor_id.eq.${userId},resource_id.eq.${userId}`)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get user activity:', error);
    return [];
  }
}

/**
 * Get user's login history
 */
export async function getUserLoginHistory(userId: string, limit: number = 20) {
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
    console.error('Failed to get user login history:', error);
    return [];
  }
}

/**
 * Deactivate user account (soft delete)
 * @param userId - auth.users.id (NOT profiles.id)
 */
export async function deactivateUser(userId: string, reason?: string): Promise<void> {
  try {
    console.log(`Deactivating user ${userId}, reason: ${reason}`);

    // Ensure security settings exist
    await ensureUserSecuritySettings(userId);

    // Lock the account permanently
    await lockAccount(userId, reason || 'Account deactivated by administrator', true);

    // Log the deactivation
    await logAudit({
      action: AuditAction.USER_DEACTIVATED,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        reason,
        deactivated_at: new Date().toISOString(),
      },
    });

    console.log(`Successfully deactivated user ${userId}`);
  } catch (error) {
    console.error('Failed to deactivate user:', error);
    throw error;
  }
}

/**
 * Activate user account
 * @param userId - auth.users.id (NOT profiles.id)
 */
export async function activateUser(userId: string): Promise<void> {
  try {
    console.log(`Activating user ${userId}`);

    // Ensure security settings exist
    await ensureUserSecuritySettings(userId);

    // Unlock the account
    await unlockAccount(userId, 'Account activated by administrator');

    // Log the activation
    await logAudit({
      action: AuditAction.USER_ACTIVATED,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        activated_at: new Date().toISOString(),
      },
    });

    console.log(`Successfully activated user ${userId}`);
  } catch (error) {
    console.error('Failed to activate user:', error);
    throw error;
  }
}

/**
 * Delete user permanently (use with caution)
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    // Get user details before deletion for audit log
    const user = await getUserDetails(userId);

    // Log the deletion BEFORE deleting (won't work after)
    await logAudit({
      action: AuditAction.USER_DELETED,
      resourceType: 'user',
      resourceId: userId,
      oldValue: {
        email: user?.email,
        role: user?.role,
      },
      metadata: {
        deleted_at: new Date().toISOString(),
      },
    });

    // Delete from auth.users (will cascade to profiles and related tables)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}
