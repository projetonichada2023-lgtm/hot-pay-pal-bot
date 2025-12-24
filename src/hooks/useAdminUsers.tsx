import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'client';
  email?: string;
  business_name?: string;
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      // Get client info for each admin user
      const adminUsers: AdminUser[] = [];
      
      for (const role of roles || []) {
        const { data: client } = await supabase
          .from('clients')
          .select('business_name, business_email')
          .eq('user_id', role.user_id)
          .maybeSingle();

        adminUsers.push({
          id: role.id,
          user_id: role.user_id,
          role: role.role as 'admin' | 'client',
          email: client?.business_email || undefined,
          business_name: client?.business_name || undefined,
        });
      }

      return adminUsers;
    },
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['all-users-for-admin'],
    queryFn: async () => {
      // Get all clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, user_id, business_name, business_email');

      if (clientsError) throw clientsError;

      // Get all roles to check who is already admin
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      return (clients || []).map(client => ({
        ...client,
        isAdmin: roleMap.get(client.user_id) === 'admin',
      }));
    },
  });
};

export const useAddAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRole) {
        // Update existing role to admin
        const { error } = await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-users-for-admin'] });
      toast.success('Administrador adicionado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar administrador: ' + error.message);
    },
  });
};

export const useRemoveAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Change role back to client instead of deleting
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'client' })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-users-for-admin'] });
      toast.success('Administrador removido com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao remover administrador: ' + error.message);
    },
  });
};
