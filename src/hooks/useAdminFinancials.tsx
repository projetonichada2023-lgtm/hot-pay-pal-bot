import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface FinancialMetrics {
  mrr: number;
  churn: number;
  ltv: number;
  growthRate: number;
  monthlyRevenue: MonthlyRevenue[];
  revenueByStatus: { status: string; value: number }[];
}

export const useAdminFinancials = () => {
  return useQuery({
    queryKey: ["admin-financials"],
    queryFn: async (): Promise<FinancialMetrics> => {
      // Get all subscriptions for MRR calculation
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("status, price, billing_cycle, cancelled_at, started_at");

      // Get orders for last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const { data: orders } = await supabase
        .from("orders")
        .select("amount, status, created_at, paid_at")
        .gte("created_at", twelveMonthsAgo.toISOString());

      // Calculate MRR (Monthly Recurring Revenue)
      const activeSubscriptions = subscriptions?.filter((s) => s.status === "active") || [];
      const mrr = activeSubscriptions.reduce((sum, sub) => {
        const price = Number(sub.price) || 0;
        if (sub.billing_cycle === "yearly") {
          return sum + price / 12;
        }
        return sum + price;
      }, 0);

      // Calculate Churn Rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const cancelledLast30Days = subscriptions?.filter(
        (s) =>
          s.cancelled_at && new Date(s.cancelled_at) >= thirtyDaysAgo
      ).length || 0;

      const totalActiveStart = subscriptions?.filter(
        (s) =>
          s.started_at && new Date(s.started_at) < thirtyDaysAgo &&
          (s.status === "active" || s.cancelled_at)
      ).length || 1;

      const churn = (cancelledLast30Days / totalActiveStart) * 100;

      // Calculate LTV (Lifetime Value) - Average revenue per customer
      const paidOrders = orders?.filter((o) => o.status === "paid" || o.status === "delivered") || [];
      const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      const uniqueCustomers = new Set(paidOrders.map((o) => o.created_at)).size || 1; // Approximation
      const ltv = totalPaidRevenue / Math.max(activeSubscriptions.length, 1);

      // Calculate Growth Rate (compare last 2 months)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const lastMonthRevenue = paidOrders
        .filter((o) => new Date(o.created_at!) >= oneMonthAgo)
        .reduce((sum, o) => sum + Number(o.amount), 0);

      const previousMonthRevenue = paidOrders
        .filter(
          (o) =>
            new Date(o.created_at!) >= twoMonthsAgo &&
            new Date(o.created_at!) < oneMonthAgo
        )
        .reduce((sum, o) => sum + Number(o.amount), 0);

      const growthRate =
        previousMonthRevenue > 0
          ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
          : 0;

      // Calculate monthly revenue for last 6 months
      const monthlyRevenue: MonthlyRevenue[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthName = monthStart.toLocaleDateString("pt-BR", { month: "short" });

        const monthOrders = paidOrders.filter((o) => {
          const orderDate = new Date(o.created_at!);
          return orderDate >= monthStart && orderDate < monthEnd;
        });

        monthlyRevenue.push({
          month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          revenue: monthOrders.reduce((sum, o) => sum + Number(o.amount), 0),
          orders: monthOrders.length,
        });
      }

      // Revenue by status
      const revenueByStatus = [
        {
          status: "Pago",
          value: orders?.filter((o) => o.status === "paid").reduce((sum, o) => sum + Number(o.amount), 0) || 0,
        },
        {
          status: "Entregue",
          value: orders?.filter((o) => o.status === "delivered").reduce((sum, o) => sum + Number(o.amount), 0) || 0,
        },
        {
          status: "Pendente",
          value: orders?.filter((o) => o.status === "pending").reduce((sum, o) => sum + Number(o.amount), 0) || 0,
        },
        {
          status: "Cancelado",
          value: orders?.filter((o) => o.status === "cancelled").reduce((sum, o) => sum + Number(o.amount), 0) || 0,
        },
      ];

      return {
        mrr,
        churn,
        ltv,
        growthRate,
        monthlyRevenue,
        revenueByStatus,
      };
    },
  });
};
