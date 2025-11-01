import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { recordLoginAttempt, checkAccountLockout } from '@/utils/loginSecurity';
import { logAudit } from '@/utils/auditLogger';
import { AuditAction } from '@/types/security';
import { createSession, terminateAllUserSessions } from '@/utils/sessionManagement';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to detect device info from user agent
function getDeviceInfo() {
  const ua = navigator.userAgent;

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
  else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
  }
  else if (ua.includes('Android')) {
    const match = ua.match(/Android (\d+\.?\d*)/);
    os = match ? `Android ${match[1]}` : 'Android';
  }
  else if (ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS (\d+_\d+)/);
    os = match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
  }
  else if (ua.includes('Linux')) os = 'Linux';

  // Detect device type
  let device = 'Desktop';
  if (/Mobile|Android|iPhone/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  return { browser, os, device };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // First, check if account is locked BEFORE attempting login
      // Look up user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (profile?.id) {
        const lockoutStatus = await checkAccountLockout(profile.id);

        if (lockoutStatus.isLocked) {
          const message = lockoutStatus.lockedUntil
            ? `Account is locked until ${new Date(lockoutStatus.lockedUntil).toLocaleString()}. ${lockoutStatus.reason || ''}`
            : `Account is locked. ${lockoutStatus.reason || 'Please contact support.'}`;

          // Record failed attempt due to lockout
          await recordLoginAttempt({
            email,
            success: false,
            userId: profile.id,
            failureReason: 'Account locked',
          });

          toast({
            title: "Account Locked",
            description: message,
            variant: "destructive",
          });

          return { error: { message } };
        }
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Record failed login attempt (recordLoginAttempt will look up userId by email)
        await recordLoginAttempt({
          email,
          success: false,
          userId: undefined, // Will be looked up by email
          failureReason: error.message,
        });

        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data?.user) {
        // Successful login
        const userId = data.user?.id;

        console.log('Login successful, logging activity...', { userId, email });

        // Get device information
        const deviceInfo = getDeviceInfo();

        // Get timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Fetch IP address and geolocation
        let ipAddress: string | undefined;
        let location: { city?: string; country?: string; timezone?: string } = { timezone };

        try {
          const geoResponse = await fetch('https://ipapi.co/json/');
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            ipAddress = geoData.ip;
            location = {
              city: geoData.city,
              country: geoData.country_name,
              timezone: geoData.timezone || timezone,
            };
            console.log('Geolocation data fetched:', { ipAddress, location });
          }
        } catch (geoError) {
          console.warn('Failed to fetch geolocation, using fallback:', geoError);
          // Continue with just timezone if geolocation fails
        }

        // Create session record in user_sessions table
        const sessionId = await createSession(
          userId,
          deviceInfo,
          ipAddress,
          location
        );

        console.log('Session created:', sessionId);

        // Record successful login attempt and audit log in parallel
        await Promise.all([
          recordLoginAttempt({
            email,
            success: true,
            userId,
          }),
          logAudit({
            action: AuditAction.LOGIN_SUCCESS,
            resourceType: 'session',
            resourceId: sessionId || undefined,
            metadata: {
              email,
              timestamp: new Date().toISOString(),
              device: deviceInfo,
              session_token_prefix: data.session?.access_token.substring(0, 10),
            },
          })
        ]);

        console.log('Login activity logged successfully');

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }

      return { error };
    } catch (err: any) {
      toast({
        title: "Sign in error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      const userId = user?.id;

      // Terminate all user sessions
      if (userId) {
        await terminateAllUserSessions(userId, 'User logged out');
        console.log('All sessions terminated for user:', userId);
      }

      // Log the logout before signing out
      await logAudit({
        action: AuditAction.LOGOUT,
        resourceType: 'session',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });

      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (err) {
      console.error('Error during sign out:', err);
      // Still attempt to sign out even if session termination fails
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};