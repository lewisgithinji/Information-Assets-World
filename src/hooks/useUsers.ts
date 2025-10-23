import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // First get user IDs with admin/editor roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'editor']);
      
      if (roleError) throw roleError;
      
      const userIds = roleData?.map(r => r.user_id) || [];
      
      if (userIds.length === 0) return [];
      
      // Then get profiles for those users
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      
      if (error) throw error;
      return data;
    },
  });
};
