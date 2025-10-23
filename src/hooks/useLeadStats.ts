import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLeadStats = () => {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: async () => {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status, created_at');
      
      if (error) throw error;

      const now = new Date();
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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

      return {
        totalNew,
        totalContacted,
        totalConfirmed,
        leadsThisWeek,
        leadsThisMonth,
        conversionRate: `${conversionRate}%`,
      };
    },
  });
};
