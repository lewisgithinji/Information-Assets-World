import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useToast } from '@/hooks/use-toast';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor';
}

export default function AdminProtectedRoute({ 
  children, 
  requiredRole = 'editor' 
}: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      if (!hasRole(requiredRole === 'admin' ? 'admin' : ['admin', 'editor'])) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    }
  }, [user, authLoading, roleLoading, hasRole, requiredRole, navigate, toast]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasRole(requiredRole === 'admin' ? 'admin' : ['admin', 'editor'])) {
    return null;
  }

  return <>{children}</>;
}