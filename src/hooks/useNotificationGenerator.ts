import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLeadStats } from '@/hooks/useLeadStats';
import { useQueryClient } from '@tanstack/react-query';

export const useNotificationGenerator = () => {
  const { user } = useAuth();
  const { data: stats } = useLeadStats();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !stats) return;

    const generateNotifications = async () => {
      try {
        // Get leads for notifications
        const { data: leads, error } = await supabase
          .from('leads')
          .select('id, full_name, next_action_date, assigned_to, status')
          .in('status', ['new', 'contacted', 'qualified'])
          .not('next_action_date', 'is', null);

        if (error) throw error;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        // Check for existing notifications today to avoid duplicates
        const { data: existingNotifications } = await supabase
          .from('notifications')
          .select('lead_id, type')
          .eq('user_id', user.id)
          .gte('created_at', new Date().toISOString().split('T')[0]);

        const existingLeadNotifications = new Set(
          existingNotifications?.map((n) => `${n.lead_id}-${n.type}`) || []
        );

        const notificationsToCreate = [];

        for (const lead of leads || []) {
          // Only create notifications for assigned leads or if user is admin
          if (lead.assigned_to && lead.assigned_to !== user.id) continue;

          const notificationKey = `${lead.id}`;

          // Overdue follow-ups
          if (lead.next_action_date && lead.next_action_date < today) {
            const key = `${lead.id}-overdue_followup`;
            if (!existingLeadNotifications.has(key)) {
              const daysOverdue = Math.floor(
                (new Date().getTime() - new Date(lead.next_action_date).getTime()) / 86400000
              );
              notificationsToCreate.push({
                user_id: user.id,
                type: 'overdue_followup',
                title: 'Overdue Follow-up',
                message: `Follow up with ${lead.full_name} was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago`,
                lead_id: lead.id,
              });
            }
          }

          // Today's follow-ups
          if (lead.next_action_date === today) {
            const key = `${lead.id}-today_followup`;
            if (!existingLeadNotifications.has(key)) {
              notificationsToCreate.push({
                user_id: user.id,
                type: 'today_followup',
                title: "Today's Follow-up",
                message: `Follow up with ${lead.full_name} is scheduled for today`,
                lead_id: lead.id,
              });
            }
          }

          // Upcoming follow-ups (tomorrow)
          if (lead.next_action_date === tomorrow) {
            const key = `${lead.id}-upcoming_followup`;
            if (!existingLeadNotifications.has(key)) {
              notificationsToCreate.push({
                user_id: user.id,
                type: 'upcoming_followup',
                title: 'Upcoming Follow-up',
                message: `Follow up with ${lead.full_name} is scheduled for tomorrow`,
                lead_id: lead.id,
              });
            }
          }
        }

        // Bulk insert notifications
        if (notificationsToCreate.length > 0) {
          const { error: insertError } = await supabase
            .from('notifications')
            .insert(notificationsToCreate);

          if (insertError) throw insertError;

          // Invalidate notifications query to refresh
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      } catch (error) {
        console.error('Error generating notifications:', error);
      }
    };

    // Generate notifications on mount and every 5 minutes
    generateNotifications();
    const interval = setInterval(generateNotifications, 300000);

    return () => clearInterval(interval);
  }, [user, stats, queryClient]);
};
