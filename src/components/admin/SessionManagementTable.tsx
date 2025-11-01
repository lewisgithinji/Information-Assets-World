import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  LogOut,
  MoreVertical,
  Wifi,
  Users,
} from 'lucide-react';
import {
  getAllActiveSessions,
  terminateSession,
  terminateAllUserSessions,
  getSessionStats,
  detectSuspiciousSessions,
  type SessionWithUser,
} from '@/utils/sessionManagement';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SessionManagementTable() {
  const [sessions, setSessions] = useState<SessionWithUser[]>([]);
  const [suspiciousSessions, setSuspiciousSessions] = useState<SessionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalActiveSessions: 0,
    uniqueActiveUsers: 0,
    avgSessionsPerUser: 0,
    expiringSoon: 0,
  });

  // Dialog states
  const [selectedSession, setSelectedSession] = useState<SessionWithUser | null>(null);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);
  const [terminatingSession, setTerminatingSession] = useState(false);

  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all active sessions
      const sessionsData = await getAllActiveSessions();
      setSessions(sessionsData);

      // Fetch session statistics
      const statsData = await getSessionStats();
      setStats(statsData);

      // Detect suspicious sessions
      const suspicious = await detectSuspiciousSessions();
      setSuspiciousSessions(suspicious);

      console.log(`Loaded ${sessionsData.length} sessions, ${suspicious.length} suspicious`);
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTerminateSession = async () => {
    if (!selectedSession) return;

    try {
      setTerminatingSession(true);
      const success = await terminateSession(
        selectedSession.id,
        'Terminated by administrator'
      );

      if (success) {
        toast({
          title: 'Session Terminated',
          description: `Successfully terminated session for ${selectedSession.user_email}`,
        });
        fetchSessions();
      } else {
        throw new Error('Failed to terminate session');
      }
    } catch (err: any) {
      console.error('Error terminating session:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to terminate session',
        variant: 'destructive',
      });
    } finally {
      setTerminatingSession(false);
      setShowTerminateDialog(false);
      setSelectedSession(null);
    }
  };

  const handleTerminateAllUserSessions = async () => {
    if (!selectedSession) return;

    try {
      setTerminatingSession(true);
      const count = await terminateAllUserSessions(
        selectedSession.user_id,
        'All sessions terminated by administrator'
      );

      toast({
        title: 'Sessions Terminated',
        description: `Successfully terminated ${count} session(s) for ${selectedSession.user_email}`,
      });
      fetchSessions();
    } catch (err: any) {
      console.error('Error terminating sessions:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to terminate sessions',
        variant: 'destructive',
      });
    } finally {
      setTerminatingSession(false);
      setShowTerminateAllDialog(false);
      setSelectedSession(null);
    }
  };

  const getDeviceIcon = (deviceInfo: any) => {
    const device = deviceInfo?.device?.toLowerCase() || '';
    if (device.includes('mobile') || device.includes('phone')) {
      return <Smartphone className="h-4 w-4 text-blue-500" />;
    }
    if (device.includes('tablet') || device.includes('ipad')) {
      return <Tablet className="h-4 w-4 text-purple-500" />;
    }
    return <Monitor className="h-4 w-4 text-gray-500" />;
  };

  const getDeviceDescription = (deviceInfo: any): string => {
    const browser = deviceInfo?.browser || 'Unknown Browser';
    const os = deviceInfo?.os || 'Unknown OS';
    const device = deviceInfo?.device || 'Unknown Device';
    return `${browser} on ${os} (${device})`;
  };

  const isSuspicious = (sessionId: string): boolean => {
    return suspiciousSessions.some(s => s.id === sessionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading sessions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load sessions: {error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSessions}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Sessions Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-blue-700 dark:text-blue-300 font-medium">
                Active Sessions
              </CardDescription>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Wifi className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {stats.totalActiveSessions}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
              Currently online
            </div>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-purple-700 dark:text-purple-300 font-medium">
                Active Users
              </CardDescription>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.uniqueActiveUsers}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center text-xs text-muted-foreground">
              <Monitor className="h-3 w-3 mr-1" />
              Unique users logged in
            </div>
          </CardContent>
        </Card>

        {/* Avg Sessions Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-emerald-700 dark:text-emerald-300 font-medium">
                Avg Sessions/User
              </CardDescription>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {stats.avgSessionsPerUser}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="flex-1 h-1 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${Math.min((stats.avgSessionsPerUser / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suspicious Sessions Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-red-700 dark:text-red-300 font-medium">
                Suspicious Sessions
              </CardDescription>
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {suspiciousSessions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center text-xs">
              {suspiciousSessions.length > 0 ? (
                <span className="flex items-center text-red-600 dark:text-red-400 font-medium">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2 animate-pulse" />
                  Require attention
                </span>
              ) : (
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                  All clear
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
            </p>
            {suspiciousSessions.length > 0 && (
              <p className="text-sm text-destructive flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {suspiciousSessions.length} suspicious session{suspiciousSessions.length !== 1 ? 's' : ''} detected
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Wifi className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active sessions</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Device</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Device Info</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className={isSuspicious(session.id) ? 'bg-destructive/5' : ''}
                  >
                    <TableCell>
                      {getDeviceIcon(session.device_info)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.user_email}</div>
                        {session.user_name && (
                          <div className="text-sm text-muted-foreground">
                            {session.user_name}
                          </div>
                        )}
                        <Badge variant="outline" className="mt-1">
                          {session.user_role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getDeviceDescription(session.device_info)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.location ? (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>
                            {session.location.city && `${session.location.city}, `}
                            {session.location.country || 'Unknown'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-muted-foreground">
                        {session.ip_address || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isSuspicious(session.id) ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Suspicious
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSession(session);
                              setShowTerminateDialog(true);
                            }}
                            className="text-destructive"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Terminate Session
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSession(session);
                              setShowTerminateAllDialog(true);
                            }}
                            className="text-destructive"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Terminate All User Sessions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Terminate Session Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Session?</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this session? The user will be logged out immediately.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">User:</span> {selectedSession.user_email}
              </div>
              <div>
                <span className="font-medium">Device:</span> {getDeviceDescription(selectedSession.device_info)}
              </div>
              <div>
                <span className="font-medium">IP Address:</span> {selectedSession.ip_address || 'N/A'}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTerminateDialog(false);
                setSelectedSession(null);
              }}
              disabled={terminatingSession}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTerminateSession}
              disabled={terminatingSession}
            >
              {terminatingSession ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Terminating...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Terminate Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate All Sessions Dialog */}
      <Dialog open={showTerminateAllDialog} onOpenChange={setShowTerminateAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate All User Sessions?</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate ALL sessions for this user? This will log them out from all devices.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">User:</span> {selectedSession.user_email}
              </div>
              <div>
                <span className="font-medium">Active Sessions:</span>{' '}
                {sessions.filter(s => s.user_id === selectedSession.user_id).length}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTerminateAllDialog(false);
                setSelectedSession(null);
              }}
              disabled={terminatingSession}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTerminateAllUserSessions}
              disabled={terminatingSession}
            >
              {terminatingSession ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Terminating...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Terminate All Sessions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
