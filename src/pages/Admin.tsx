import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, FileText, Users, Building2, Award, Plus } from 'lucide-react';

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  if (!user) {
    return null;
  }

  const adminSections = [
    {
      title: 'Events',
      description: 'Manage conferences, exhibitions, and galas',
      icon: Calendar,
      color: 'from-primary to-primary-dark',
      path: '/admin/events',
      count: '12 Active'
    },
    {
      title: 'Papers',
      description: 'Manage research papers and publications',
      icon: FileText,
      color: 'from-teal to-primary',
      path: '/admin/papers',
      count: '45 Published'
    },
    {
      title: 'Speakers',
      description: 'Manage speaker profiles and information',
      icon: Users,
      color: 'from-accent to-accent-light',
      path: '/admin/speakers',
      count: '28 Active'
    },
    {
      title: 'Sponsors',
      description: 'Manage sponsor partnerships and tiers',
      icon: Award,
      color: 'from-secondary-dark to-muted-dark',
      path: '/admin/sponsors',
      count: '15 Partners'
    },
    {
      title: 'Offices',
      description: 'Manage global office locations',
      icon: Building2,
      color: 'from-muted-dark to-secondary',
      path: '/admin/offices',
      count: '7 Locations'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Manage your Information Assets World content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="hover:shadow-lg transition-all duration-300 group border-card-border">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{section.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">{section.count}</span>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => navigate(section.path)}
                        className="w-full"
                        variant="outline"
                      >
                        View All
                      </Button>
                      <Button 
                        onClick={() => navigate(`${section.path}/new`)}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}