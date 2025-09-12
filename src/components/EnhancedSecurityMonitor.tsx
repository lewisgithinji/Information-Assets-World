import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  UserPlus,
  Mail,
  Settings,
  Eye,
  Lock,
  Database,
  Server
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EnhancedSecurityMonitor = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const { toast } = useToast();

  const securityMetrics = [
    { label: 'Active Users', value: '2,847', status: 'normal', icon: Users },
    { label: 'Failed Logins', value: '12', status: 'warning', icon: AlertTriangle },
    { label: 'Security Events', value: '3', status: 'critical', icon: Shield },
    { label: 'Database Queries', value: '15.2k', status: 'normal', icon: Database },
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'john.doe@example.com',
      action: 'Login successful',
      timestamp: '2 minutes ago',
      risk: 'low'
    },
    {
      id: 2,
      user: 'admin@iaw.com',
      action: 'Created new event',
      timestamp: '15 minutes ago',
      risk: 'low'
    },
    {
      id: 3,
      user: 'unknown@suspicious.com',
      action: 'Multiple failed login attempts',
      timestamp: '1 hour ago',
      risk: 'high'
    },
    {
      id: 4,
      user: 'editor@iaw.com',
      action: 'Updated user permissions',
      timestamp: '2 hours ago',
      risk: 'medium'
    }
  ];

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteEmail} with role: ${inviteRole}`,
      });
      
      setInviteEmail('');
      setInviteRole('user');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'normal':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${getStatusColor(metric.status)}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Invitation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite New User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button onClick={handleInviteUser} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication Service</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Degraded
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Security Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.user} • {activity.timestamp}
                  </p>
                </div>
                <Badge className={getRiskColor(activity.risk)} variant="outline">
                  {activity.risk} risk
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Enable two-factor authentication for all admin accounts to improve security.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Review and update password policies - consider requiring 12+ character passwords.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Set up automated security monitoring for unusual login patterns.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSecurityMonitor;