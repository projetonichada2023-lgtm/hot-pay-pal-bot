import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClient } from "./useClient";

export interface Subscription {
  id: string;
  client_id: string;
  plan_type: "free" | "basic" | "pro" | "enterprise";
  status: "active" | "cancelled" | "expired" | "trial" | "pending";
  price: number | null;
  billing_cycle: "monthly" | "yearly" | null;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface PlanLimits {
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

export const useSubscription = () => {
  const { data: client } = useClient();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", client?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("client_id", client!.id)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!client?.id,
  });

  const planLimitsQuery = useQuery({
    queryKey: ["plan-limits", subscriptionQuery.data?.plan_type || "free"],
    queryFn: async () => {
      const planType = subscriptionQuery.data?.plan_type || "free";
      const { data, error } = await supabase
        .from("plan_limits")
        .select("*")
        .eq("plan_type", planType)
        .single();

      if (error) throw error;
      return data as PlanLimits;
    },
    enabled: subscriptionQuery.isSuccess,
  });

  const isActive = 
    subscriptionQuery.data?.status === "active" || 
    subscriptionQuery.data?.status === "trial";

  const isPro = 
    subscriptionQuery.data?.plan_type === "pro" || 
    subscriptionQuery.data?.plan_type === "enterprise";

  return {
    subscription: subscriptionQuery.data,
    planLimits: planLimitsQuery.data,
    isLoading: subscriptionQuery.isLoading || planLimitsQuery.isLoading,
    isActive,
    isPro,
    planType: subscriptionQuery.data?.plan_type || "free",
  };
};
