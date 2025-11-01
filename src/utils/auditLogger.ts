/**
 * Audit Logger Utility
 * Centralized logging for all administrative and security actions
 */

import { supabase } from '@/integrations/supabase/client';
import type { AuditAction, LogAuditParams } from '@/types/security';

/**
 * Get client IP address (best effort)
 * Note: In production, this should be determined server-side
 */
async function getClientIP(): Promise<string | undefined> {
  try {
    // In a real app, you'd get this from a server-side API
    // For now, we'll use a public IP service or return undefined
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return undefined;
  }
}

/**
 * Log an audit event
 * Records administrative and security actions for compliance and security monitoring
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Get IP address with timeout to prevent blocking
    const ipAddressPromise = Promise.race([
      getClientIP(),
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 2000))
    ]);

    // Prepare audit log entry (log immediately, don't wait for IP)
    const auditLog = {
      actor_id: user?.id,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      old_value: params.oldValue,
      new_value: params.newValue,
      metadata: params.metadata,
      ip_address: undefined, // Will be filled in a moment
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Try to get IP with timeout, but don't block on it
    const ipAddress = await ipAddressPromise;
    auditLog.ip_address = ipAddress;

    console.log('Logging audit event:', params.action, auditLog);

    // Insert into audit_logs table
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditLog);

    if (error) {
      console.error('Failed to log audit event:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Attempted to insert:', JSON.stringify(auditLog, null, 2));
      // Don't throw - audit logging should not break app functionality
    } else {
      console.log('Successfully logged audit event:', params.action);
    }
  } catch (error) {
    console.error('Unexpected error in audit logging:', error);
    // Don't throw - audit logging should not break app functionality
  }
}

/**
 * Log multiple audit events in a batch
 */
export async function logAuditBatch(events: LogAuditParams[]): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const ipAddress = await getClientIP();

    const auditLogs = events.map(event => ({
      actor_id: user?.id,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      old_value: event.oldValue,
      new_value: event.newValue,
      metadata: event.metadata,
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('audit_logs')
      .insert(auditLogs);

    if (error) {
      console.error('Failed to log batch audit events:', error);
    }
  } catch (error) {
    console.error('Unexpected error in batch audit logging:', error);
  }
}

/**
 * Format audit log description for display
 */
export function formatAuditDescription(log: {
  action: string;
  resource_type: string;
  old_value?: any;
  new_value?: any;
}): string {
  const action = log.action.split('.').pop() || log.action;
  const resource = log.resource_type;

  switch (log.action) {
    case 'user.created':
      return `Created new ${resource}`;

    case 'user.deleted':
      return `Deleted ${resource}`;

    case 'user.role.updated':
      const oldRole = log.old_value?.role;
      const newRole = log.new_value?.role;
      return `Changed role from ${oldRole} to ${newRole}`;

    case 'password.changed':
      return 'Changed password';

    case 'password.reset':
      return 'Reset password';

    case 'password.force_change':
      return 'Forced password change';

    case 'account.locked':
      return `Locked account${log.new_value?.reason ? `: ${log.new_value.reason}` : ''}`;

    case 'account.unlocked':
      return 'Unlocked account';

    case 'two_factor.enabled':
      return 'Enabled two-factor authentication';

    case 'two_factor.disabled':
      return 'Disabled two-factor authentication';

    default:
      return `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`;
  }
}

/**
 * Get action color for UI display
 */
export function getAuditActionColor(action: string): string {
  if (action.includes('delete') || action.includes('locked')) {
    return 'destructive';
  }
  if (action.includes('create') || action.includes('enabled')) {
    return 'success';
  }
  if (action.includes('update') || action.includes('changed')) {
    return 'warning';
  }
  return 'default';
}

/**
 * Get action icon for UI display
 */
export function getAuditActionIcon(action: string): string {
  if (action.includes('user')) return 'user';
  if (action.includes('password')) return 'key';
  if (action.includes('role')) return 'shield';
  if (action.includes('two_factor')) return 'smartphone';
  if (action.includes('session')) return 'monitor';
  if (action.includes('locked')) return 'lock';
  return 'activity';
}
