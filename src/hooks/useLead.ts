import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useLead = (leadId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leadId) return;

    const channel = supabase
      .channel('lead-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, queryClient]);

  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error('Lead ID is required');

      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();
      
      if (error) throw error;
      
      // Fetch assigned user separately if exists
      if (lead.assigned_to) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .eq('user_id', lead.assigned_to)
          .single();
        
        return {
          ...lead,
          assigned_user: profile
        };
      }
      
      return lead;
    },
    enabled: !!leadId,
  });
};
