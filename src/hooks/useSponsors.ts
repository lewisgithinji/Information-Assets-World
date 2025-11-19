import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SponsorType = 'sponsor' | 'partner' | 'client';

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: string | null;
  type: SponsorType;
  created_at: string;
  updated_at: string;
}

export const useSponsors = (type?: SponsorType) => {
  return useQuery({
    queryKey: ['sponsors', type],
    queryFn: async () => {
      let query = supabase
        .from('sponsors')
        .select('*')
        .order('tier', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Sponsor[];
    },
  });
};
