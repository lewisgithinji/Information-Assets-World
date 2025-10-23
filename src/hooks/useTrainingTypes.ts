import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTrainingTypes = () => {
  return useQuery({
    queryKey: ['training-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
