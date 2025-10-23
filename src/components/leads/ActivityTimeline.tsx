import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLeadActivities } from '@/hooks/useLeadActivities';
import { ACTIVITY_ICONS } from '@/utils/leadStatusWorkflow';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { AddActivityDialog } from './AddActivityDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ActivityTimelineProps {
  leadId: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ leadId }) => {
  const { data: activities, isLoading } = useLeadActivities(leadId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `lead_id=eq.${leadId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activities', leadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, queryClient]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Timeline</CardTitle>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
        ) : activities && activities.length > 0 ? (
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

            {activities.map((activity: any, index: number) => (
              <div key={activity.id} className="relative pl-10">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {ACTIVITY_ICONS[activity.activity_type] || '📌'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{activity.summary}</p>
                      {activity.details && (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {activity.details}
                        </p>
                      )}
                      {activity.next_action && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-primary">Next Action: </span>
                          <span>{activity.next_action}</span>
                        </div>
                      )}
                      {activity.follow_up_date && (
                        <div className="text-sm text-muted-foreground">
                          Follow-up: {format(new Date(activity.follow_up_date), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(activity.created_at), 'MMM dd, yyyy • h:mm a')}</span>
                    {activity.logged_by_user && (
                      <>
                        <span>•</span>
                        <span>{activity.logged_by_user.full_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No activities logged yet</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Activity
            </Button>
          </div>
        )}
      </CardContent>

      <AddActivityDialog
        leadId={leadId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
};
