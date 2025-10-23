import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  FileText, 
  Users, 
  Award, 
  Building,
  Shield,
  LayoutDashboard,
  ChevronLeft,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';

const AdminSidebar = () => {
  const location = useLocation();
  const { role } = useRole();

  const adminItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: Calendar
    },
    {
      name: 'Papers',
      href: '/admin/papers',
      icon: FileText
    },
    {
      name: 'Speakers',
      href: '/admin/speakers',
      icon: Users
    },
    {
      name: 'Sponsors',
      href: '/admin/sponsors',
      icon: Award
    },
    {
      name: 'Offices',
      href: '/admin/offices',
      icon: Building
    },
    {
      name: 'Event Categories',
      href: '/admin/event-categories',
      icon: Calendar
    },
    {
      name: 'All Leads',
      href: '/admin/leads',
      icon: ClipboardList
    }
  ];

  // Add security center for admin users only
  if (role === 'admin') {
    adminItems.push({
      name: 'Security Center',
      href: '/admin/security',
      icon: Shield
    });
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="w-64 min-h-screen bg-muted/20 border-r border-border">
      <div className="p-4">
        {/* Back to main site */}
        <Button variant="outline" asChild className="w-full mb-6">
          <Link to="/">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Link>
        </Button>

        {/* Admin Navigation */}
        <nav className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-3 mb-3">
            Admin Panel
          </h3>
          
          {adminItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(item.href, item.exact)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;