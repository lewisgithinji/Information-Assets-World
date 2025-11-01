/**
 * Lead Analytics Dashboard
 * Comprehensive analytics and insights for lead management
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Funnel,
  FunnelChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  Award,
  Activity,
  BarChart3,
} from 'lucide-react';
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from 'date-fns';

interface Lead {
  id: string;
  status: string;
  priority: string;
  source?: string;
  created_at: string;
  contacted_at?: string;
  last_activity?: string;
  training_interest?: string;
  budget?: string;
}

interface LeadAnalyticsDashboardProps {
  leads: Lead[];
}

// Colors for charts
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
};

const STATUS_COLORS: Record<string, string> = {
  new: COLORS.primary,
  contacted: COLORS.warning,
  qualified: COLORS.purple,
  confirmed: COLORS.success,
  lost: COLORS.danger,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: COLORS.warning,
  high: COLORS.danger,
};

export function LeadAnalyticsDashboard({ leads }: LeadAnalyticsDashboardProps) {
  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    // Status distribution
    const statusDistribution = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityDistribution = leads.reduce((acc, lead) => {
      acc[lead.priority] = (acc[lead.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Source distribution
    const sourceDistribution = leads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Training interest distribution
    const trainingInterestDistribution = leads.reduce((acc, lead) => {
      const interest = lead.training_interest || 'Not specified';
      acc[interest] = (acc[interest] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Time-based trends (last 30 days)
    const dailyLeads: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(now, i), 'MMM dd');
      dailyLeads[date] = 0;
    }

    leads.forEach(lead => {
      const createdDate = new Date(lead.created_at);
      if (createdDate >= last30Days) {
        const dateKey = format(createdDate, 'MMM dd');
        if (dailyLeads[dateKey] !== undefined) {
          dailyLeads[dateKey]++;
        }
      }
    });

    // Conversion funnel
    const totalLeads = leads.length;
    const contactedLeads = leads.filter(l => l.status !== 'new').length;
    const qualifiedLeads = leads.filter(l => ['qualified', 'confirmed'].includes(l.status)).length;
    const confirmedLeads = leads.filter(l => l.status === 'confirmed').length;

    // Response time analysis
    const responseTimesInHours = leads
      .filter(l => l.contacted_at && l.created_at)
      .map(l => {
        const created = new Date(l.created_at).getTime();
        const contacted = new Date(l.contacted_at!).getTime();
        return (contacted - created) / (1000 * 60 * 60); // hours
      });

    const avgResponseTime = responseTimesInHours.length > 0
      ? responseTimesInHours.reduce((a, b) => a + b, 0) / responseTimesInHours.length
      : 0;

    // Recent activity (last 7 days)
    const recentLeads = leads.filter(l => new Date(l.created_at) >= last7Days).length;
    const previousPeriodLeads = leads.filter(l => {
      const created = new Date(l.created_at);
      return created >= subDays(last7Days, 7) && created < last7Days;
    }).length;
    const growthRate = previousPeriodLeads > 0
      ? ((recentLeads - previousPeriodLeads) / previousPeriodLeads) * 100
      : 0;

    // Conversion rate
    const conversionRate = totalLeads > 0 ? (confirmedLeads / totalLeads) * 100 : 0;

    return {
      statusDistribution,
      priorityDistribution,
      sourceDistribution,
      trainingInterestDistribution,
      dailyLeads,
      totalLeads,
      contactedLeads,
      qualifiedLeads,
      confirmedLeads,
      conversionRate,
      avgResponseTime,
      recentLeads,
      growthRate,
    };
  }, [leads]);

  // Format data for charts
  const statusData = Object.entries(analytics.statusDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: STATUS_COLORS[name] || COLORS.primary,
  }));

  const priorityData = Object.entries(analytics.priorityDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: PRIORITY_COLORS[name] || COLORS.primary,
  }));

  const sourceData = Object.entries(analytics.sourceDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const trainingData = Object.entries(analytics.trainingInterestDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({
      subject: name.length > 20 ? name.substring(0, 20) + '...' : name,
      value,
      fullMark: Math.max(...Object.values(analytics.trainingInterestDistribution)),
    }));

  const trendData = Object.entries(analytics.dailyLeads).map(([date, count]) => ({
    date,
    leads: count,
  }));

  const funnelData = [
    { name: 'Total Leads', value: analytics.totalLeads, fill: COLORS.primary },
    { name: 'Contacted', value: analytics.contactedLeads, fill: COLORS.warning },
    { name: 'Qualified', value: analytics.qualifiedLeads, fill: COLORS.purple },
    { name: 'Confirmed', value: analytics.confirmedLeads, fill: COLORS.success },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Leads</CardDescription>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {analytics.totalLeads}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              <span className={analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(analytics.growthRate).toFixed(1)}%
              </span>
              <span className="ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Conversion Rate</CardDescription>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {analytics.conversionRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-xs text-muted-foreground">
              {analytics.confirmedLeads} confirmed from {analytics.totalLeads} total
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Avg Response Time</CardDescription>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {analytics.avgResponseTime.toFixed(1)}h
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-xs text-muted-foreground">
              Time to first contact
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>This Week</CardDescription>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {analytics.recentLeads}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-xs text-muted-foreground">
              New leads in last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Conversion Funnel
                </CardTitle>
                <CardDescription>Lead progression through pipeline stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {funnelData.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-semibold text-lg">{item.value}</div>
                      <div className="text-muted-foreground text-xs">{item.name}</div>
                      {idx > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {((item.value / funnelData[idx - 1].value) * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Status Distribution
                </CardTitle>
                <CardDescription>Current lead status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {statusData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm">
                        {item.name}: <span className="font-semibold">{item.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Priority Levels
                </CardTitle>
                <CardDescription>Lead priority distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Lead Generation Trends
              </CardTitle>
              <CardDescription>Daily lead creation over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lead Sources
              </CardTitle>
              <CardDescription>Where your leads are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={COLORS.teal} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Training Interests
              </CardTitle>
              <CardDescription>Most requested training programs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={trainingData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis />
                  <Radar
                    name="Leads"
                    dataKey="value"
                    stroke={COLORS.purple}
                    fill={COLORS.purple}
                    fillOpacity={0.6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
