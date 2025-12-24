import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type AdminOrder = Tables<"orders"> & {
  client?: { business_name: string } | null;
  product?: { name: string } | null;
  customer?: { first_name: string | null; telegram_username: string | null } | null;
};

interface AdminOrdersFilters {
  status?: string;
  period?: "today" | "week" | "month" | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useAdminOrders = (filters: AdminOrdersFilters = {}) => {
  const { status, period = "all", search = "", page = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ["admin-orders", status, period, search, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(`
          *,
          client:clients(business_name),
          product:products(name),
          customer:telegram_customers(first_name, telegram_username)
        `, { count: "exact" })
        .order("created_at", { ascending: false });

      // Status filter
      if (status && status !== "all") {
        query = query.eq("status", status as "pending" | "paid" | "delivered" | "cancelled" | "refunded");
      }

      // Period filter
      if (period !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Client-side search (after fetch)
      let filteredData = data as AdminOrder[];
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(
          (order) =>
            order.client?.business_name?.toLowerCase().includes(searchLower) ||
            order.product?.name?.toLowerCase().includes(searchLower) ||
            order.customer?.first_name?.toLowerCase().includes(searchLower) ||
            order.customer?.telegram_username?.toLowerCase().includes(searchLower)
        );
      }

      return {
        orders: filteredData,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });
};

export const useAdminOrdersStats = (period: "today" | "week" | "month" | "all" = "all") => {
  return useQuery({
    queryKey: ["admin-orders-stats", period],
    queryFn: async () => {
      let query = supabase.from("orders").select("status, amount, created_at");

      // Period filter
      if (period !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: 0,
        paid: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        totalRevenue: 0,
        paidRevenue: 0,
      };

      data.forEach((order) => {
        const amount = Number(order.amount);
        stats.totalRevenue += amount;

        switch (order.status) {
          case "pending":
            stats.pending++;
            break;
          case "paid":
            stats.paid++;
            stats.paidRevenue += amount;
            break;
          case "delivered":
            stats.delivered++;
            stats.paidRevenue += amount;
            break;
          case "cancelled":
            stats.cancelled++;
            break;
          case "refunded":
            stats.refunded++;
            break;
        }
      });

      return stats;
    },
  });
};
