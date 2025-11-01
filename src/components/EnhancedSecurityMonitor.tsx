import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  Lock,
  Database,
  TrendingUp,
  UserCheck,
  RefreshCw,
  Eye,
  XCircle,
  Clock,
  MapPin,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getSecurityMetrics,
  getRecentActivity,
  getSecurityEvents,
  getTopFailedLoginIPs,
  getSystemHealth,
  resolveSecurityEvent,
  getLoginTrends,
  type SecurityMetrics,
  type RecentActivity as RecentActivityType,
  type SecurityEvent,
  type LoginTrend,
} from '@/utils/securityStats';

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
};

const EnhancedSecurityMonitor = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeUsers: 0,
    totalUsers: 0,
    failedLogins: 0,
    securityEvents: 0,
    criticalEvents: 0,
    activeSessions: 0,
    lockedAccounts: 0,
    recentSignups: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityType[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [topFailedIPs, setTopFailedIPs] = useState<Array<{ ip: string; count: number }>>([]);
  const [loginTrends, setLoginTrends] = useState<LoginTrend[]>([]);
  const [systemHealth, setSystemHealth] = useState({ database: true, auth: true, storage: true });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAllData = async (showToast = false) => {
    try {
      setRefreshing(true);

      const [
        metricsData,
        activityData,
        eventsData,
        ipsData,
        healthData,
        trendsData,
      ] = await Promise.all([
        getSecurityMetrics(),
        getRecentActivity(5),
        getSecurityEvents(3),
        getTopFailedLoginIPs(5),
        getSystemHealth(),
        getLoginTrends(7),
      ]);

      setMetrics(metricsData);
      setRecentActivity(activityData);
      setSecurityEvents(eventsData);
      setTopFailedIPs(ipsData);
      setSystemHealth(healthData);
      setLoginTrends(trendsData);

      if (showToast) {
        toast({
          title: 'Dashboard Refreshed',
          description: 'All security metrics have been updated.',
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchAllData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveEvent = async (eventId: string) => {
    const success = await resolveSecurityEvent(eventId);
    if (success) {
      toast({
        title: 'Event Resolved',
        description: 'Security event has been marked as resolved.',
      });
      fetchAllData();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to resolve security event',
        variant: 'destructive',
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Prepare chart data
  const userStatusData = [
    { name: 'Active', value: metrics.activeUsers, color: COLORS.success },
    { name: 'Inactive', value: metrics.totalUsers - metrics.activeUsers, color: COLORS.warning },
    { name: 'Locked', value: metrics.lockedAccounts, color: COLORS.danger },
  ];

  const loginTrendData = loginTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    successful: trend.successful,
    failed: trend.failed,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-sm text-muted-foreground">Real-time security monitoring and metrics</p>
        </div>
        <Button
          onClick={() => fetchAllData(true)}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Active Users</p>
                <p className="text-3xl font-bold text-blue-900">{formatNumber(metrics.activeUsers)}</p>
                <p className="text-xs text-blue-600 mt-1">of {formatNumber(metrics.totalUsers)} total</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${metrics.failedLogins > 50 ? 'from-red-50 to-red-100 border-red-200' : 'from-yellow-50 to-yellow-100 border-yellow-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${metrics.failedLogins > 50 ? 'text-red-700' : 'text-yellow-700'}`}>Failed Logins</p>
                <p className={`text-3xl font-bold ${metrics.failedLogins > 50 ? 'text-red-900' : 'text-yellow-900'}`}>{metrics.failedLogins}</p>
                <p className={`text-xs mt-1 ${metrics.failedLogins > 50 ? 'text-red-600' : 'text-yellow-600'}`}>Last 24 hours</p>
              </div>
              <AlertTriangle className={`h-10 w-10 ${metrics.failedLogins > 50 ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${metrics.criticalEvents > 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-green-50 to-green-100 border-green-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${metrics.criticalEvents > 0 ? 'text-red-700' : 'text-green-700'}`}>Security Events</p>
                <p className={`text-3xl font-bold ${metrics.criticalEvents > 0 ? 'text-red-900' : 'text-green-900'}`}>{metrics.securityEvents}</p>
                <p className={`text-xs mt-1 ${metrics.criticalEvents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.criticalEvents} critical
                </p>
              </div>
              <Shield className={`h-10 w-10 ${metrics.criticalEvents > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Sessions</p>
                <p className="text-3xl font-bold text-green-900">{formatNumber(metrics.activeSessions)}</p>
                <p className="text-xs text-green-600 mt-1">Currently online</p>
              </div>
              <Activity className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Login Trends (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={loginTrendData}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="successful"
                  stroke={COLORS.success}
                  fillOpacity={1}
                  fill="url(#colorSuccess)"
                  name="Successful Logins"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke={COLORS.danger}
                  fillOpacity={1}
                  fill="url(#colorDanger)"
                  name="Failed Logins"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Locked Accounts</span>
              </div>
              <Badge variant={metrics.lockedAccounts > 0 ? "destructive" : "outline"}>
                {metrics.lockedAccounts}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">New Signups</span>
              </div>
              <Badge variant="outline">{metrics.recentSignups} (7 days)</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Engagement Rate</span>
              </div>
              <Badge variant="outline" className="bg-green-50">
                {metrics.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side by Side: Security Events & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unresolved Security Events */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Unresolved Security Events
              </div>
              {securityEvents.length > 0 && (
                <Badge variant="destructive">{securityEvents.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {securityEvents.length > 0 ? (
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getSeverityColor(event.severity)} size="sm">
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-1">
                      {event.event_type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveEvent(event.id)}
                      className="w-full"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark as Resolved
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No unresolved security events</p>
                <p className="text-xs text-muted-foreground mt-1">Your system is secure</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Security Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={getRiskColor(activity.risk)} variant="outline" size="sm">
                        {activity.risk} risk
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">By: {activity.user}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No recent activity to display</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <span className="text-sm font-medium">Database Connection</span>
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <span className="text-sm font-medium">Authentication Service</span>
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <span className="text-sm font-medium">Storage Service</span>
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Top Failed Login IPs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Failed Login IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topFailedIPs.length > 0 ? (
              <div className="space-y-2">
                {topFailedIPs.map((item, index) => (
                  <div key={item.ip} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-mono text-sm font-medium">{item.ip}</span>
                    </div>
                    <Badge variant={item.count > 10 ? "destructive" : "secondary"}>
                      {item.count} attempts
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No failed login attempts</p>
                <p className="text-xs text-muted-foreground mt-1">in the last 24 hours</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.lockedAccounts > 5 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                You have {metrics.lockedAccounts} locked accounts. Review these accounts in User Management to determine if they should be unlocked.
              </AlertDescription>
            </Alert>
          )}

          {metrics.failedLogins > 100 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                High number of failed login attempts detected ({metrics.failedLogins} in last 24h). Consider implementing additional security measures.
              </AlertDescription>
            </Alert>
          )}

          {metrics.criticalEvents > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                You have {metrics.criticalEvents} critical security event{metrics.criticalEvents > 1 ? 's' : ''} that require immediate attention.
              </AlertDescription>
            </Alert>
          )}

          {metrics.totalUsers > 0 && (metrics.activeUsers / metrics.totalUsers) < 0.3 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Eye className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                Low user engagement detected. Only {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% of users have been active in the last 30 days.
              </AlertDescription>
            </Alert>
          )}

          {metrics.lockedAccounts === 0 && metrics.failedLogins < 20 && metrics.criticalEvents === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                Your security posture looks excellent! All metrics are within normal ranges.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSecurityMonitor;
