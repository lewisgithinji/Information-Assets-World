import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DatabasePaper {
  id: string;
  title: string;
  abstract: string | null;
  authors: string[];
  category: string | null;
  tags: string[] | null;
  status: string;
  pdf_url: string | null;
  published_date: string | null;
  created_at: string;
  updated_at: string;
}

export const usePapers = () => {
  return useQuery({
    queryKey: ['papers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DatabasePaper[];
    },
  });
};

export const usePaper = (id: string) => {
  return useQuery({
    queryKey: ['paper', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as DatabasePaper;
    },
    enabled: !!id,
  });
};