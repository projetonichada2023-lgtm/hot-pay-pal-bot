import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Get total clients
      const { count: totalClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });

      // Get active clients
      const { count: activeClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get total orders
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Get paid orders and sum revenue
      const { data: paidOrders } = await supabase
        .from("orders")
        .select("amount")
        .eq("status", "paid");

      const totalRevenue = paidOrders?.reduce(
        (sum, order) => sum + Number(order.amount),
        0
      ) || 0;

      // Get subscriptions stats
      const { count: activeSubscriptions } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: trialSubscriptions } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "trial");

      // Get clients created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newClientsThisMonth } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        activeSubscriptions: activeSubscriptions || 0,
        trialSubscriptions: trialSubscriptions || 0,
        newClientsThisMonth: newClientsThisMonth || 0,
      };
    },
  });
};
