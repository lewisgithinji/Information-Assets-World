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

      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_user:profiles(user_id, full_name, email)
        `)
        .eq('id', leadId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });
};
