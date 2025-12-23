import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type Order = Tables<'orders'> & {
  products?: Tables<'products'> | null;
  telegram_customers?: Tables<'telegram_customers'> | null;
};

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled' | 'refunded';

export interface PaginatedOrdersResult {
  orders: Order[];
  totalCount: number;
  totalPages: number;
}

export const useOrders = (
  clientId: string, 
  status?: OrderStatus | null,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: ['orders', clientId, status, page, pageSize],
    queryFn: async (): Promise<PaginatedOrdersResult> => {
      // First get total count
      let countQuery = supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId);

      if (status) {
        countQuery = countQuery.eq('status', status);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Then get paginated data
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('orders')
        .select('*, products(*), telegram_customers(*)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return {
        orders: data as Order[],
        totalCount,
        totalPages,
      };
    },
    enabled: !!clientId,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      clientId, 
      status, 
      extra 
    }: { 
      orderId: string; 
      clientId: string; 
      status: OrderStatus;
      extra?: Partial<TablesUpdate<'orders'>>;
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, ...extra })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.clientId] });
    },
  });
};

export const useOrderStats = (clientId: string) => {
  return useQuery({
    queryKey: ['order-stats', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status, amount')
        .eq('client_id', clientId);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: 0,
        paid: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        totalRevenue: 0,
      };

      data.forEach(order => {
        if (order.status) {
          stats[order.status as keyof typeof stats]++;
        }
        if (order.status === 'paid' || order.status === 'delivered') {
          stats.totalRevenue += Number(order.amount);
        }
      });

      return stats;
    },
    enabled: !!clientId,
  });
};
