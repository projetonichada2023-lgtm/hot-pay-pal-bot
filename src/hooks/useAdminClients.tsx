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
    mutationFn: async ({ clientId, isActive }: { clientId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("clients")
        .update({ is_active: isActive })
        .eq("id", clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      toast.success("Status do cliente atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar status do cliente");
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    toggleClientActive,
  };
};
