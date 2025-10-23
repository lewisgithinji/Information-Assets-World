import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadFilters {
  status?: string[];
  country?: string[];
  training_interest?: string;
  assigned_to?: string;
  search?: string;
  dateRange?: [Date, Date];
  followUpStatus?: ('overdue' | 'today' | 'this_week' | 'none')[];
}

export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      if (filters?.country && filters.country.length > 0) {
        query = query.in('country', filters.country);
      }
      
      if (filters?.training_interest) {
        query = query.eq('training_interest', filters.training_interest);
      }
      
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,` +
          `email.ilike.%${filters.search}%,` +
          `organization.ilike.%${filters.search}%,` +
          `reference_number.ilike.%${filters.search}%`
        );
      }
      
      if (filters?.dateRange) {
        const [start, end] = filters.dateRange;
        query = query
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());
      }

      // Follow-up status filters
      if (filters?.followUpStatus && filters.followUpStatus.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        const conditions: string[] = [];

        if (filters.followUpStatus.includes('overdue')) {
          conditions.push(`next_action_date.lt.${today}`);
        }
        if (filters.followUpStatus.includes('today')) {
          conditions.push(`next_action_date.eq.${today}`);
        }
        if (filters.followUpStatus.includes('this_week')) {
          conditions.push(`and(next_action_date.gt.${today},next_action_date.lte.${nextWeekStr})`);
        }
        if (filters.followUpStatus.includes('none')) {
          conditions.push('next_action_date.is.null');
        }

        if (conditions.length > 0) {
          query = query.or(conditions.join(','));
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};
