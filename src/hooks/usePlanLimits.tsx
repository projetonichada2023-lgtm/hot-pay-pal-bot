import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "./useSubscription";
import { useClient } from "./useClient";
import { toast } from "sonner";

export interface PlanUsage {
  productsCount: number;
  ordersThisMonth: number;
  recoveryMessagesCount: number;
}

export const usePlanLimits = () => {
  const { data: client } = useClient();
  const { planLimits, planType, isActive } = useSubscription();

  const usageQuery = useQuery({
    queryKey: ["plan-usage", client?.id],
    queryFn: async () => {
      // Get products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client!.id);

      // Get orders this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: ordersThisMonth } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client!.id)
        .gte("created_at", startOfMonth.toISOString());

      // Get recovery messages count
      const { count: recoveryMessagesCount } = await supabase
        .from("cart_recovery_messages")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client!.id)
        .eq("is_active", true);

      return {
        productsCount: productsCount || 0,
        ordersThisMonth: ordersThisMonth || 0,
        recoveryMessagesCount: recoveryMessagesCount || 0,
      } as PlanUsage;
    },
    enabled: !!client?.id,
  });

  const canAddProduct = () => {
    if (!planLimits || !usageQuery.data) return true;
    if (planLimits.max_products === -1) return true;
    return usageQuery.data.productsCount < planLimits.max_products;
  };

  const canCreateOrder = () => {
    if (!planLimits || !usageQuery.data) return true;
    if (planLimits.max_orders_per_month === -1) return true;
    return usageQuery.data.ordersThisMonth < planLimits.max_orders_per_month;
  };

  const canAddRecoveryMessage = () => {
    if (!planLimits || !usageQuery.data) return true;
    if (planLimits.max_recovery_messages === -1) return true;
    return usageQuery.data.recoveryMessagesCount < planLimits.max_recovery_messages;
  };

  const canUseUpsell = () => {
    return planLimits?.upsell_enabled || false;
  };

  const canUseCartRecovery = () => {
    return planLimits?.cart_recovery_enabled || false;
  };

  const canUseCustomMessages = () => {
    return planLimits?.custom_messages_enabled || false;
  };

  const showLimitReachedToast = (feature: string) => {
    toast.error(`Limite atingido`, {
      description: `Você atingiu o limite de ${feature} do seu plano. Faça upgrade para continuar.`,
    });
  };

  const getRemainingProducts = () => {
    if (!planLimits || !usageQuery.data) return 0;
    if (planLimits.max_products === -1) return Infinity;
    return Math.max(0, planLimits.max_products - usageQuery.data.productsCount);
  };

  const getRemainingOrders = () => {
    if (!planLimits || !usageQuery.data) return 0;
    if (planLimits.max_orders_per_month === -1) return Infinity;
    return Math.max(0, planLimits.max_orders_per_month - usageQuery.data.ordersThisMonth);
  };

  const getRemainingRecoveryMessages = () => {
    if (!planLimits || !usageQuery.data) return 0;
    if (planLimits.max_recovery_messages === -1) return Infinity;
    return Math.max(0, planLimits.max_recovery_messages - usageQuery.data.recoveryMessagesCount);
  };

  return {
    usage: usageQuery.data,
    isLoading: usageQuery.isLoading,
    planLimits,
    planType,
    isActive,
    // Check functions
    canAddProduct,
    canCreateOrder,
    canAddRecoveryMessage,
    canUseUpsell,
    canUseCartRecovery,
    canUseCustomMessages,
    // Remaining counts
    getRemainingProducts,
    getRemainingOrders,
    getRemainingRecoveryMessages,
    // Helper
    showLimitReachedToast,
    refetch: usageQuery.refetch,
  };
};
