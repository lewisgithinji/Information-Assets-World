import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { canTransitionTo } from '@/utils/leadStatusWorkflow';
import type { LeadStatus, LeadPriority } from '@/types/lead';

export const useLeadMutations = () => {
  const queryClient = useQueryClient();

  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, newStatus, currentStatus, reason }: {
      leadId: string;
      newStatus: LeadStatus;
      currentStatus: LeadStatus;
      reason?: string;
    }) => {
      if (!canTransitionTo(currentStatus, newStatus)) {
        throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
      }

      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          lead_id: leadId,
          activity_type: 'status_change',
          summary: `Status changed from ${currentStatus} to ${newStatus}`,
          details: reason || `Lead status updated to ${newStatus}`,
          logged_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (activityError) console.error('Failed to log activity:', activityError);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities', variables.leadId] });
      toast({
        title: "Status Updated",
        description: "Lead status has been updated successfully.",
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

  const updateLeadPriority = useMutation({
    mutationFn: async ({ leadId, priority }: { leadId: string; priority: LeadPriority }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ priority, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        lead_id: leadId,
        activity_type: 'note',
        summary: `Priority changed to ${priority}`,
        logged_by: (await supabase.auth.getUser()).data.user?.id,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Priority Updated",
        description: "Lead priority has been updated successfully.",
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

  const assignLead = useMutation({
    mutationFn: async ({ leadId, userId }: { leadId: string; userId: string | null }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ assigned_to: userId, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      const user = await supabase.auth.getUser();
      await supabase.from('activities').insert({
        lead_id: leadId,
        activity_type: 'note',
        summary: userId ? 'Lead assigned' : 'Lead unassigned',
        logged_by: user.data.user?.id,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead Assigned",
        description: "Lead has been assigned successfully.",
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

  const updateLeadNotes = useMutation({
    mutationFn: async ({ leadId, notes }: { leadId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ internal_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      toast({
        title: "Notes Updated",
        description: "Internal notes have been saved.",
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

  const updateNextAction = useMutation({
    mutationFn: async ({ leadId, nextAction, nextActionDate }: { 
      leadId: string; 
      nextAction: string; 
      nextActionDate?: string;
    }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          next_action: nextAction,
          next_action_date: nextActionDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      toast({
        title: "Next Action Updated",
        description: "Follow-up action has been scheduled.",
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
    updateLeadStatus,
    updateLeadPriority,
    assignLead,
    updateLeadNotes,
    updateNextAction,
  };
};
