import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlanLimit {
  id: string;
  plan_type: "free" | "basic" | "pro" | "enterprise";
  max_products: number;
  max_orders_per_month: number;
  max_recovery_messages: number;
  upsell_enabled: boolean;
  cart_recovery_enabled: boolean;
  custom_messages_enabled: boolean;
  priority_support: boolean;
}

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
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

export const usePlanLimits = () => {
  return useQuery({
    queryKey: ["plan-limits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_limits")
        .select("*")
        .order("plan_type");

      if (error) throw error;
      return data as PlanLimit[];
    },
  });
};

export const useUpdatePlanLimit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planLimit: Partial<PlanLimit> & { id: string }) => {
      // Get old data first
      const { data: oldData } = await supabase
        .from("plan_limits")
        .select("*")
        .eq("id", planLimit.id)
        .single();

      const { id, ...updates } = planLimit;
      const { data, error } = await supabase
        .from("plan_limits")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        'update',
        'plan_limits',
        id,
        oldData as Record<string, unknown>,
        data as Record<string, unknown>
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan-limits"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Limite do plano atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar limite: " + error.message);
    },
  });
};

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .order("setting_key");

      if (error) throw error;
      return data as AdminSetting[];
    },
  });
};

export const useUpdateAdminSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Get old value first
      const { data: oldData } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("setting_key", key)
        .single();

      const { data, error } = await supabase
        .from("admin_settings")
        .update({ setting_value: value })
        .eq("setting_key", key)
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        'settings_update',
        'settings',
        oldData?.id,
        { key, value: oldData?.setting_value },
        { key, value }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Configuração atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
};
