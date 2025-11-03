import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const today = new Date().toISOString();

      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date, end_date, location, category, event_type')
        .eq('status', 'published')
        .gte('start_date', today)
        .order('start_date', { ascending: true })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
};
