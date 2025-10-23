import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLeadStats = () => {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: async () => {
      // Get basic stats
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status, created_at, next_action_date');
      
      if (error) throw error;

      const now = new Date();
      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const totalNew = leads.filter(l => l.status === 'new').length;
      const totalContacted = leads.filter(l => l.status === 'contacted').length;
      const totalConfirmed = leads.filter(l => l.status === 'confirmed').length;
      const leadsThisWeek = leads.filter(l => new Date(l.created_at) >= thisWeek).length;
      const leadsThisMonth = leads.filter(l => new Date(l.created_at) >= thisMonth).length;
      
      const confirmedThisMonth = leads.filter(
        l => l.status === 'confirmed' && new Date(l.created_at) >= thisMonth
      ).length;
      const conversionRate = leadsThisMonth > 0 
        ? ((confirmedThisMonth / leadsThisMonth) * 100).toFixed(1)
        : '0.0';

      // Follow-up stats
      const overdueFollowUps = leads.filter(
        l => l.next_action_date && l.next_action_date < today && !['confirmed', 'lost'].includes(l.status)
      ).length;

      const todayFollowUps = leads.filter(
        l => l.next_action_date === today && !['confirmed', 'lost'].includes(l.status)
      ).length;

      const upcomingFollowUps = leads.filter(
        l => l.next_action_date && l.next_action_date > today && l.next_action_date <= nextWeekStr && !['confirmed', 'lost'].includes(l.status)
      ).length;

      const noFollowUpScheduled = leads.filter(
        l => !l.next_action_date && ['new', 'contacted', 'qualified'].includes(l.status)
      ).length;

      return {
        totalNew,
        totalContacted,
        totalConfirmed,
        leadsThisWeek,
        leadsThisMonth,
        conversionRate: `${conversionRate}%`,
        overdueFollowUps,
        todayFollowUps,
        upcomingFollowUps,
        noFollowUpScheduled,
      };
    },
  });
};
