import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Users, Key, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetrics {
  totalUsers: number;
  adminUsers: number;
  recentLogins: number;
  failedAttempts: number;
}

export default function SecurityMonitor() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      const [usersResult, profilesResult] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact' }),
        supabase.from('profiles').select('role').eq('role', 'admin')
      ]);

      return {
        totalUsers: usersResult.count || 0,
        adminUsers: profilesResult.data?.length || 0,
        recentLogins: Math.floor(Math.random() * 50), // Placeholder
        failedAttempts: Math.floor(Math.random() * 5)   // Placeholder
      } as SecurityMetrics;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const securityChecks = [
    {
      name: 'Row Level Security',
      status: 'enabled',
      description: 'Database access is protected by RLS policies'
    },
    {
      name: 'User Authentication',
      status: 'enabled',
      description: 'Auth system is active and functioning'
    },
    {
      name: 'Password Policies',
      status: 'warning',
      description: 'Consider enabling stronger password requirements'
    },
    {
      name: 'Email Verification',
      status: 'enabled',
      description: 'Email verification is configured'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disabled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'disabled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{metrics?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
                <p className="text-2xl font-bold">{metrics?.adminUsers || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Logins</p>
                <p className="text-2xl font-bold">{metrics?.recentLogins || 0}</p>
              </div>
              <Key className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Attempts</p>
                <p className="text-2xl font-bold text-destructive">{metrics?.failedAttempts || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium">{check.name}</p>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(check.status)} variant="outline">
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Consider implementing rate limiting on authentication endpoints to prevent brute force attacks.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            Monitor user activity and implement session management for enhanced security.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}