import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLeadActivities = (leadId: string) => {
  return useQuery({
    queryKey: ['activities', leadId],
    queryFn: async () => {
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch logged by users separately if there are any activities
      if (activities && activities.length > 0) {
        const loggedByIds = [...new Set(activities.map(a => a.logged_by).filter(Boolean))];
        
        if (loggedByIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', loggedByIds);
          
          const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
          
          return activities.map(activity => ({
            ...activity,
            logged_by_user: activity.logged_by ? profileMap.get(activity.logged_by) : null
          }));
        }
      }
      
      return activities;
    },
    enabled: !!leadId,
  });
};
