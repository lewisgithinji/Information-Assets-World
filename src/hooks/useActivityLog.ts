/**
 * Activity Logging Hook
 * Provides easy-to-use functions for logging activities throughout the application
 */

import { logAudit } from '@/utils/auditLogger';
import { AuditAction } from '@/types/security';

export function useActivityLog() {
  /**
   * Log a lead-related activity
   */
  const logLeadActivity = async (
    action: 'created' | 'updated' | 'deleted' | 'status_changed',
    leadId: string,
    details?: {
      oldValue?: any;
      newValue?: any;
      metadata?: any;
    }
  ) => {
    const actionMap = {
      created: 'lead.created' as const,
      updated: 'lead.updated' as const,
      deleted: 'lead.deleted' as const,
      status_changed: 'lead.status.changed' as const,
    };

    await logAudit({
      action: actionMap[action] as any,
      resourceType: 'lead',
      resourceId: leadId,
      oldValue: details?.oldValue,
      newValue: details?.newValue,
      metadata: details?.metadata,
    });
  };

  /**
   * Log a user management activity
   */
  const logUserActivity = async (
    action: 'created' | 'deleted' | 'role_updated' | 'profile_updated',
    userId: string,
    details?: {
      oldValue?: any;
      newValue?: any;
      metadata?: any;
    }
  ) => {
    const actionMap = {
      created: AuditAction.USER_CREATED,
      deleted: AuditAction.USER_DELETED,
      role_updated: AuditAction.USER_ROLE_UPDATED,
      profile_updated: AuditAction.USER_PROFILE_UPDATED,
    };

    await logAudit({
      action: actionMap[action],
      resourceType: 'user',
      resourceId: userId,
      oldValue: details?.oldValue,
      newValue: details?.newValue,
      metadata: details?.metadata,
    });
  };

  /**
   * Log a security-related activity
   */
  const logSecurityActivity = async (
    action: 'account_locked' | 'account_unlocked' | '2fa_enabled' | '2fa_disabled',
    userId: string,
    details?: {
      reason?: string;
      metadata?: any;
    }
  ) => {
    const actionMap = {
      account_locked: AuditAction.ACCOUNT_LOCKED,
      account_unlocked: AuditAction.ACCOUNT_UNLOCKED,
      '2fa_enabled': AuditAction.TWO_FACTOR_ENABLED,
      '2fa_disabled': AuditAction.TWO_FACTOR_DISABLED,
    };

    await logAudit({
      action: actionMap[action],
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        reason: details?.reason,
        ...details?.metadata,
      },
    });
  };

  /**
   * Log a custom activity
   */
  const logCustomActivity = async (
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: {
      oldValue?: any;
      newValue?: any;
      metadata?: any;
    }
  ) => {
    await logAudit({
      action: action as any,
      resourceType,
      resourceId,
      oldValue: details?.oldValue,
      newValue: details?.newValue,
      metadata: details?.metadata,
    });
  };

  return {
    logLeadActivity,
    logUserActivity,
    logSecurityActivity,
    logCustomActivity,
  };
}
