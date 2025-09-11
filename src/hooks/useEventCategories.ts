import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EventCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  industry_sector: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export const useEventCategories = () => {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as EventCategory[];
    },
  });
};

export const useEventTypes = () => {
  return useQuery({
    queryKey: ['event-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as EventType[];
    },
  });
};