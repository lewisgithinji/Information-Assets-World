import { ReactNode } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useRole } from '@/hooks/useRole';
import { Navigate } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin' && role !== 'editor') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b px-6 py-3 flex justify-end bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <NotificationBell />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;