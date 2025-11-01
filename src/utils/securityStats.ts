/**
 * Security Statistics Utilities
 * Functions for fetching real-time security metrics and statistics
 */

import { supabase } from '@/integrations/supabase/client';

export interface SecurityMetrics {
  activeUsers: number;
  totalUsers: number;
  failedLogins: number;
  securityEvents: number;
  criticalEvents: number;
  activeSessions: number;
  lockedAccounts: number;
  recentSignups: number;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  risk: 'low' | 'medium' | 'high';
  metadata?: any;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id: string | null;
  description: string;
  created_at: string;
  resolved: boolean;
}

export interface LoginTrend {
  date: string;
  successful: number;
  failed: number;
}

/**
 * Get comprehensive security metrics
 */
export async function getSecurityMetrics(): Promise<SecurityMetrics> {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentLogins } = await supabase
      .from('login_attempts')
      .select('user_id')
      .eq('success', true)
      .gte('timestamp', thirtyDaysAgo.toISOString());

    const activeUsers = new Set(recentLogins?.map(l => l.user_id).filter(Boolean)).size;

    // Get failed logins in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { count: failedLogins } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('success', false)
      .gte('timestamp', oneDayAgo.toISOString());

    // Get unresolved security events
    const { count: securityEvents } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);

    // Get critical unresolved events
    const { count: criticalEvents } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false)
      .in('severity', ['high', 'critical']);

    // Get active sessions
    const { count: activeSessions } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString());

    // Get locked accounts
    const { count: lockedAccounts } = await supabase
      .from('user_security_settings')
      .select('*', { count: 'exact', head: true })
      .eq('account_locked', true);

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSignups } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    return {
      activeUsers: activeUsers || 0,
      totalUsers: totalUsers || 0,
      failedLogins: failedLogins || 0,
      securityEvents: securityEvents || 0,
      criticalEvents: criticalEvents || 0,
      activeSessions: activeSessions || 0,
      lockedAccounts: lockedAccounts || 0,
      recentSignups: recentSignups || 0,
    };
  } catch (error) {
    console.error('Failed to fetch security metrics:', error);
    return {
      activeUsers: 0,
      totalUsers: 0,
      failedLogins: 0,
      securityEvents: 0,
      criticalEvents: 0,
      activeSessions: 0,
      lockedAccounts: 0,
      recentSignups: 0,
    };
  }
}

/**
 * Get recent security activity
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  try {
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('id, action, resource_type, timestamp, metadata, actor_id')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (!auditLogs) return [];

    // Get actor emails separately
    const actorIds = auditLogs.map(log => log.actor_id).filter(Boolean) as string[];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, email')
      .in('user_id', actorIds);

    const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);

    return auditLogs.map(log => {
      let risk: 'low' | 'medium' | 'high' = 'low';

      // Determine risk level based on action
      if (log.action.includes('deleted') || log.action.includes('locked')) {
        risk = 'high';
      } else if (log.action.includes('updated') || log.action.includes('role')) {
        risk = 'medium';
      }

      // Format action for display
      const action = log.action
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        id: log.id,
        user: log.actor_id ? (emailMap.get(log.actor_id) || 'Unknown User') : 'System',
        action: `${action} (${log.resource_type})`,
        timestamp: new Date(log.timestamp).toISOString(),
        risk,
        metadata: log.metadata,
      };
    });
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return [];
  }
}

/**
 * Get unresolved security events
 */
export async function getSecurityEvents(limit: number = 10): Promise<SecurityEvent[]> {
  try {
    const { data: events } = await supabase
      .from('security_events')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    return events || [];
  } catch (error) {
    console.error('Failed to fetch security events:', error);
    return [];
  }
}

/**
 * Resolve a security event
 */
export async function resolveSecurityEvent(eventId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('security_events')
      .update({
        resolved: true,
        resolved_by: user?.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to resolve security event:', error);
    return false;
  }
}

/**
 * Get login trends for the last N days
 */
export async function getLoginTrends(days: number = 7): Promise<LoginTrend[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: logins } = await supabase
      .from('login_attempts')
      .select('timestamp, success')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (!logins) return [];

    // Group by date
    const trendMap = new Map<string, { successful: number; failed: number }>();

    logins.forEach(login => {
      const date = new Date(login.timestamp).toISOString().split('T')[0];
      const existing = trendMap.get(date) || { successful: 0, failed: 0 };

      if (login.success) {
        existing.successful++;
      } else {
        existing.failed++;
      }

      trendMap.set(date, existing);
    });

    // Convert to array
    return Array.from(trendMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  } catch (error) {
    console.error('Failed to fetch login trends:', error);
    return [];
  }
}

/**
 * Get top failed login IPs
 */
export async function getTopFailedLoginIPs(limit: number = 5): Promise<Array<{ ip: string; count: number }>> {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: attempts } = await supabase
      .from('login_attempts')
      .select('ip_address')
      .eq('success', false)
      .gte('timestamp', oneDayAgo.toISOString());

    if (!attempts) return [];

    // Count by IP
    const ipCounts = new Map<string, number>();
    attempts.forEach(attempt => {
      if (attempt.ip_address) {
        ipCounts.set(attempt.ip_address, (ipCounts.get(attempt.ip_address) || 0) + 1);
      }
    });

    // Convert to array and sort
    return Array.from(ipCounts.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch top failed login IPs:', error);
    return [];
  }
}

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<{
  database: boolean;
  auth: boolean;
  storage: boolean;
}> {
  try {
    // Check database
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // Check auth
    const { error: authError } = await supabase.auth.getSession();

    return {
      database: !dbError,
      auth: !authError,
      storage: true, // Assume storage is working if we can query DB
    };
  } catch (error) {
    return {
      database: false,
      auth: false,
      storage: false,
    };
  }
}
