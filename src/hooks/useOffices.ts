import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DatabaseOffice {
  id: string;
  region: string;
  city: string;
  country: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PublicOfficeLocation {
  id: string;
  region: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

// Hook for public office locations (no sensitive data)
export const usePublicOfficeLocations = () => {
  return useQuery({
    queryKey: ['public-office-locations'],
    queryFn: async (): Promise<PublicOfficeLocation[]> => {
      const { data, error } = await supabase
        .rpc('get_public_office_locations');

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook for office data with appropriate access control
export const useOffices = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['offices', user?.id],
    queryFn: async (): Promise<DatabaseOffice[]> => {
      if (!user) {
        // For unauthenticated users, return only public location data
        const { data, error } = await supabase
          .rpc('get_public_office_locations');
        
        if (error) throw error;
        
        // Transform to match interface but without sensitive fields
        return (data || []).map((office: PublicOfficeLocation) => ({
          id: office.id,
          region: office.region,
          city: office.city,
          country: office.country,
          address: null,
          email: null,
          phone: null,
          latitude: office.latitude,
          longitude: office.longitude,
          status: 'active',
          created_at: '',
          updated_at: ''
        }));
      }

      // For authenticated users, get full office data
      const { data, error } = await supabase
        .from('offices')
        .select('*')
        .eq('status', 'active')
        .order('region', { ascending: true });

      if (error) throw error;
      return data as DatabaseOffice[];
    },
  });
};

// Hook for admin office management (full CRUD)
export const useAdminOffices = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-offices'],
    queryFn: async () => {
      if (!user) throw new Error('Authentication required');
      
      const { data, error } = await supabase
        .from('offices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DatabaseOffice[];
    },
    enabled: !!user,
  });
};