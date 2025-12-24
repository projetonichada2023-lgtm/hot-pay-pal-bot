import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminClient {
  id: string;
  business_name: string;
  business_email: string | null;
  business_phone: string | null;
  is_active: boolean;
  webhook_configured: boolean;
  onboarding_completed: boolean;
  created_at: string;
  user_id: string;
  subscription?: {
    id: string;
    plan_type: string;
    status: string;
    expires_at: string | null;
  } | null;
}

const createAuditLog = async (
  action: string,
  entity_type: string,
  entity_id?: string,
  old_data?: Record<string, unknown>,
  new_data?: Record<string, unknown>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    entity_type,
    entity_id: entity_id || null,
    old_data: old_data as unknown as null,
    new_data: new_data as unknown as null,
    user_agent: navigator.userAgent,
  });
};

export const useAdminClients = () => {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data: clients, error } = await supabase
        .from("clients")
        .select(`
          id,
          business_name,
          business_email,
          business_phone,
          is_active,
          webhook_configured,
          onboarding_completed,
          created_at,
          user_id
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch subscriptions separately
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("id, client_id, plan_type, status, expires_at");

      // Map subscriptions to clients
      const clientsWithSubs = clients?.map((client) => ({
        ...client,
        subscription: subscriptions?.find((s) => s.client_id === client.id) || null,
      })) as AdminClient[];

      return clientsWithSubs || [];
    },
  });

  const toggleClientActive = useMutation({
    mutationFn: async ({ clientId, isActive, clientName }: { clientId: string; isActive: boolean; clientName?: string }) => {
      // Get old data
      const { data: oldData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      const { error } = await supabase
        .from("clients")
        .update({ is_active: isActive })
        .eq("id", clientId);

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        isActive ? 'client_activated' : 'client_deactivated',
        'client',
        clientId,
        { is_active: !isActive, business_name: clientName || oldData?.business_name },
        { is_active: isActive, business_name: clientName || oldData?.business_name }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Status do cliente atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar status do cliente");
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ 
      clientId, 
      data 
    }: { 
      clientId: string; 
      data: Partial<{ business_name: string; business_email: string; business_phone: string }> 
    }) => {
      // Get old data
      const { data: oldData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      const { error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", clientId);

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        'update',
        'client',
        clientId,
        oldData as Record<string, unknown>,
        data as Record<string, unknown>
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Cliente atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar cliente");
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    toggleClientActive,
    updateClient,
  };
};
