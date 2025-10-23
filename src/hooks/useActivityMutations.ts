import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateActivityData {
  leadId: string;
  activityType: string;
  summary: string;
  details?: string;
  nextAction?: string;
  followUpDate?: string;
}

export const useActivityMutations = () => {
  const queryClient = useQueryClient();

  const createActivity = useMutation({
    mutationFn: async (data: CreateActivityData) => {
      const user = await supabase.auth.getUser();
      
      const { data: activity, error } = await supabase
        .from('activities')
        .insert({
          lead_id: data.leadId,
          activity_type: data.activityType,
          summary: data.summary,
          details: data.details,
          next_action: data.nextAction,
          follow_up_date: data.followUpDate,
          logged_by: user.data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return activity;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      toast({
        title: "Activity Added",
        description: "Activity has been logged successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createActivity,
  };
};
