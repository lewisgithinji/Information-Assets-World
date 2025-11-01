import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Activity,
  User,
  Shield,
  Key,
  LogIn,
  LogOut,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuditAction } from '@/types/security';

interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_value: any;
  new_value: any;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  actor_email?: string;
}

export default function ActivityLogTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch audit logs
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('Error fetching audit logs:', logsError);
        setError(logsError.message);
        return;
      }

      if (!logsData || logsData.length === 0) {
        setLogs([]);
        return;
      }

      // Get unique actor IDs
      const actorIds = [...new Set(logsData.map(log => log.actor_id).filter(Boolean))];

      // Fetch user emails for actors
      let userEmailMap: Record<string, string> = {};
      if (actorIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', actorIds);

        if (usersData) {
          userEmailMap = usersData.reduce((acc, user) => {
            acc[user.id] = user.email;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Combine logs with user emails
      const transformedData = logsData.map(log => ({
        ...log,
        actor_email: log.actor_id ? (userEmailMap[log.actor_id] || 'Unknown User') : 'System'
      }));

      setLogs(transformedData);
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('login.success')) return <LogIn className="h-4 w-4 text-green-500" />;
    if (action.includes('login.failed')) return <LogIn className="h-4 w-4 text-red-500" />;
    if (action.includes('logout')) return <LogOut className="h-4 w-4 text-gray-500" />;
    if (action.includes('password')) return <Key className="h-4 w-4 text-blue-500" />;
    if (action.includes('role')) return <Shield className="h-4 w-4 text-purple-500" />;
    if (action.includes('locked')) return <Lock className="h-4 w-4 text-red-500" />;
    if (action.includes('unlocked')) return <Unlock className="h-4 w-4 text-green-500" />;
    if (action.includes('user')) return <User className="h-4 w-4 text-blue-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes('success') || action.includes('unlocked')) {
      return <Badge variant="default" className="bg-green-500">Success</Badge>;
    }
    if (action.includes('failed') || action.includes('locked')) {
      return <Badge variant="destructive">Warning</Badge>;
    }
    if (action.includes('updated') || action.includes('changed')) {
      return <Badge variant="secondary">Modified</Badge>;
    }
    if (action.includes('created')) {
      return <Badge variant="default" className="bg-blue-500">Created</Badge>;
    }
    if (action.includes('deleted')) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    return <Badge variant="outline">Info</Badge>;
  };

  const formatActionDescription = (log: AuditLog): string => {
    const action = log.action;

    // Authentication
    if (action === 'auth.login.success') {
      return `Signed in successfully${log.metadata?.email ? ` (${log.metadata.email})` : ''}`;
    }
    if (action === 'auth.login.failed') {
      return `Failed login attempt${log.metadata?.email ? ` (${log.metadata.email})` : ''}`;
    }
    if (action === 'auth.logout') {
      return 'Signed out';
    }

    // Account Security
    if (action === 'account.locked') {
      return `Account locked${log.metadata?.reason ? `: ${log.metadata.reason}` : ''}`;
    }
    if (action === 'account.unlocked') {
      return 'Account unlocked';
    }

    // User Management
    if (action === 'user.created') {
      return `Created new user${log.new_value?.email ? ` (${log.new_value.email})` : ''}`;
    }
    if (action === 'user.deleted') {
      return `Deleted user${log.old_value?.email ? ` (${log.old_value.email})` : ''}`;
    }
    if (action === 'user.role.updated') {
      const oldRole = log.old_value?.role;
      const newRole = log.new_value?.role;
      return `Role changed from ${oldRole} to ${newRole}`;
    }

    // Password
    if (action === 'password.changed') {
      return 'Password changed';
    }
    if (action === 'password.reset') {
      return 'Password reset requested';
    }

    // Lead Management
    if (action === 'lead.created') {
      return `Created new lead${log.new_value?.full_name ? ` for ${log.new_value.full_name}` : ''}`;
    }
    if (action === 'lead.updated') {
      return `Updated lead${log.new_value?.full_name ? ` for ${log.new_value.full_name}` : ''}`;
    }
    if (action === 'lead.deleted') {
      return `Deleted lead${log.old_value?.full_name ? ` for ${log.old_value.full_name}` : ''}`;
    }
    if (action === 'lead.status.changed') {
      const oldStatus = log.old_value?.status;
      const newStatus = log.new_value?.status;
      return `Changed lead status from ${oldStatus} to ${newStatus}`;
    }
    if (action === 'lead.priority.changed') {
      const oldPriority = log.old_value?.priority;
      const newPriority = log.new_value?.priority;
      return `Changed lead priority from ${oldPriority} to ${newPriority}`;
    }
    if (action === 'lead.assigned') {
      return `Assigned lead${log.metadata?.assigned_to ? ` to ${log.metadata.assigned_to}` : ''}`;
    }
    if (action === 'lead.verified') {
      return 'Verified lead';
    }

    // Fallback: format action string
    return action.split('.').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading activity logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load activity logs: {error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No activity logs yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Activity will appear here as users interact with the system
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {logs.length} recent activities
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Type</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {getActionIcon(log.action)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {log.actor_email || 'System'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="text-sm">{formatActionDescription(log)}</p>
                    {log.resource_type && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Resource: {log.resource_type}
                        {log.resource_id && ` (${log.resource_id.substring(0, 8)}...)`}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">
                    {log.ip_address || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
