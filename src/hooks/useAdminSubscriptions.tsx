import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminSubscription {
  id: string;
  client_id: string;
  plan_type: string;
  status: string;
  price: number | null;
  billing_cycle: string | null;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  client?: {
    business_name: string;
    business_email: string | null;
  };
}

export const useAdminSubscriptions = () => {
  const queryClient = useQueryClient();

  const subscriptionsQuery = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch clients for each subscription
      const { data: clients } = await supabase
        .from("clients")
        .select("id, business_name, business_email");

      const subsWithClients = subscriptions?.map((sub) => ({
        ...sub,
        client: clients?.find((c) => c.id === sub.client_id),
      })) as AdminSubscription[];

      return subsWithClients || [];
    },
  });

  const createSubscription = useMutation({
    mutationFn: async (data: {
      client_id: string;
      plan_type: "free" | "basic" | "pro" | "enterprise";
      status: "active" | "cancelled" | "expired" | "trial" | "pending";
      price?: number;
      billing_cycle?: "monthly" | "yearly";
      expires_at?: string;
    }) => {
      const { error } = await supabase.from("subscriptions").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      toast.success("Assinatura criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar assinatura");
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      plan_type?: "free" | "basic" | "pro" | "enterprise";
      status?: "active" | "cancelled" | "expired" | "trial" | "pending";
      price?: number;
      billing_cycle?: "monthly" | "yearly";
      expires_at?: string | null;
      cancelled_at?: string | null;
    }) => {
      const { error } = await supabase
        .from("subscriptions")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      toast.success("Assinatura atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar assinatura");
    },
  });

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      toast.success("Assinatura removida com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover assinatura");
    },
  });

  return {
    subscriptions: subscriptionsQuery.data || [],
    isLoading: subscriptionsQuery.isLoading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  };
};
