import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLeadStats } from '@/hooks/useLeadStats';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, Clock, Plus, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

export const FollowUpWidget: React.FC = () => {
  const { data: stats } = useLeadStats();
  const navigate = useNavigate();

  // Fetch overdue leads for preview
  const { data: overdueLeads } = useQuery({
    queryKey: ['overdue-leads-preview'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('leads')
        .select('id, reference_number, full_name, next_action_date, status')
        .lt('next_action_date', today)
        .not('status', 'in', '(confirmed,lost)')
        .order('next_action_date', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  const handleFilterClick = (filter: string) => {
    // Navigate to leads page with filter applied
    navigate(`/admin/leads?followUp=${filter}`);
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Follow-ups
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/leads')}
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleFilterClick('overdue')}
            className="p-3 rounded-lg border hover:border-destructive hover:bg-destructive/5 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Overdue</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {stats?.overdueFollowUps || 0}
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('today')}
            className="p-3 rounded-lg border hover:border-yellow-500 hover:bg-yellow-500/5 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.todayFollowUps || 0}
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('upcoming')}
            className="p-3 rounded-lg border hover:border-green-500 hover:bg-green-500/5 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Upcoming</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats?.upcomingFollowUps || 0}
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('none')}
            className="p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">No Follow-up</span>
            </div>
            <div className="text-2xl font-bold">
              {stats?.noFollowUpScheduled || 0}
            </div>
          </button>
        </div>

        {/* Overdue Leads Preview */}
        {overdueLeads && overdueLeads.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Overdue Leads
            </h4>
            <div className="space-y-2">
              {overdueLeads.map((lead) => {
                const daysOverdue = Math.abs(differenceInDays(new Date(lead.next_action_date), new Date()));
                return (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/leads/${lead.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {lead.reference_number}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {lead.full_name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
