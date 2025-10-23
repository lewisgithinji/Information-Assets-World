import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export const useBulkOperations = () => {
  const queryClient = useQueryClient();

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ leadIds, newStatus }: { leadIds: string[]; newStatus: string }) => {
      const results: BulkOperationResult = { success: 0, failed: 0, errors: [] };
      const user = await supabase.auth.getUser();

      // Process in batches of 50
      const batchSize = 50;
      for (let i = 0; i < leadIds.length; i += batchSize) {
        const batch = leadIds.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('leads')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .in('id', batch);

        if (error) {
          results.failed += batch.length;
          results.errors.push(error.message);
        } else {
          results.success += batch.length;
          
          // Log activities for this batch
          const activities = batch.map(leadId => ({
            lead_id: leadId,
            activity_type: 'status_change',
            summary: `Bulk status update to ${newStatus}`,
            logged_by: user.data.user?.id,
          }));

          await supabase.from('activities').insert(activities);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Bulk Update Complete',
        description: `Successfully updated ${results.success} leads. ${results.failed > 0 ? `Failed: ${results.failed}` : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bulk Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkAssignLeads = useMutation({
    mutationFn: async ({ leadIds, userId }: { leadIds: string[]; userId: string | null }) => {
      const results: BulkOperationResult = { success: 0, failed: 0, errors: [] };
      const user = await supabase.auth.getUser();

      const batchSize = 50;
      for (let i = 0; i < leadIds.length; i += batchSize) {
        const batch = leadIds.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('leads')
          .update({ assigned_to: userId, updated_at: new Date().toISOString() })
          .in('id', batch);

        if (error) {
          results.failed += batch.length;
          results.errors.push(error.message);
        } else {
          results.success += batch.length;
          
          // Log activities
          const activities = batch.map(leadId => ({
            lead_id: leadId,
            activity_type: 'note',
            summary: userId ? 'Bulk lead assignment' : 'Bulk lead unassignment',
            logged_by: user.data.user?.id,
          }));

          await supabase.from('activities').insert(activities);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Bulk Assignment Complete',
        description: `Successfully assigned ${results.success} leads. ${results.failed > 0 ? `Failed: ${results.failed}` : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bulk Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkUpdatePriority = useMutation({
    mutationFn: async ({ leadIds, priority }: { leadIds: string[]; priority: string }) => {
      const results: BulkOperationResult = { success: 0, failed: 0, errors: [] };
      const user = await supabase.auth.getUser();

      const batchSize = 50;
      for (let i = 0; i < leadIds.length; i += batchSize) {
        const batch = leadIds.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('leads')
          .update({ priority, updated_at: new Date().toISOString() })
          .in('id', batch);

        if (error) {
          results.failed += batch.length;
          results.errors.push(error.message);
        } else {
          results.success += batch.length;
          
          // Log activities
          const activities = batch.map(leadId => ({
            lead_id: leadId,
            activity_type: 'note',
            summary: `Bulk priority change to ${priority}`,
            logged_by: user.data.user?.id,
          }));

          await supabase.from('activities').insert(activities);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Bulk Priority Update Complete',
        description: `Successfully updated ${results.success} leads. ${results.failed > 0 ? `Failed: ${results.failed}` : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bulk Priority Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkDeleteLeads = useMutation({
    mutationFn: async ({ leadIds }: { leadIds: string[] }) => {
      const results: BulkOperationResult = { success: 0, failed: 0, errors: [] };

      const batchSize = 50;
      for (let i = 0; i < leadIds.length; i += batchSize) {
        const batch = leadIds.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('leads')
          .delete()
          .in('id', batch);

        if (error) {
          results.failed += batch.length;
          results.errors.push(error.message);
        } else {
          results.success += batch.length;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Bulk Delete Complete',
        description: `Successfully deleted ${results.success} leads. ${results.failed > 0 ? `Failed: ${results.failed}` : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bulk Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    bulkUpdateStatus,
    bulkAssignLeads,
    bulkUpdatePriority,
    bulkDeleteLeads,
  };
};
