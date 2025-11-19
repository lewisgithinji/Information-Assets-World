import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadStats {
  totalNew: number;
  totalContacted: number;
  totalConfirmed: number;
  leadsThisWeek: number;
  conversionRate: string;
}

export function useLeadStats() {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: async (): Promise<LeadStats> => {
      // Get all leads
      const { data: allLeads, error: allError } = await supabase
        .from('leads')
        .select('id, status, created_at');

      if (allError) throw allError;

      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalNew = allLeads?.filter(lead => lead.status === 'new').length || 0;
      const totalContacted = allLeads?.filter(lead => lead.status === 'contacted').length || 0;
      const totalConfirmed = allLeads?.filter(lead => lead.status === 'confirmed').length || 0;

      const leadsThisWeek = allLeads?.filter(lead => {
        const createdAt = new Date(lead.created_at);
        return createdAt >= oneWeekAgo;
      }).length || 0;

      const totalLeads = allLeads?.length || 0;
      const conversionRate = totalLeads > 0
        ? ((totalConfirmed / totalLeads) * 100).toFixed(1) + '%'
        : '0.0%';

      return {
        totalNew,
        totalContacted,
        totalConfirmed,
        leadsThisWeek,
        conversionRate,
      };
    },
  });
}
