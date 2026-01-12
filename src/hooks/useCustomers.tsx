import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClient } from './useClient';

export interface Customer {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  bot_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
}

export interface CustomerOrder {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
  product_name: string | null;
  is_upsell: boolean;
  is_downsell: boolean;
}

export interface CustomerFilters {
  search: string;
  hasOrders: 'all' | 'with_orders' | 'no_orders';
  sortBy: 'recent' | 'oldest' | 'most_orders' | 'highest_spent';
}

export const useCustomers = (filters: CustomerFilters, botId?: string | null) => {
  const clientQuery = useClient();
  const client = clientQuery.data;

  return useQuery({
    queryKey: ['customers', client?.id, filters, botId],
    queryFn: async () => {
      if (!client?.id) return [];

      // Fetch customers
      let customersQuery = supabase
        .from('telegram_customers')
        .select('*')
        .eq('client_id', client.id);

      if (botId) {
        customersQuery = customersQuery.eq('bot_id', botId);
      }

      const { data: customers, error: customersError } = await customersQuery;

      if (customersError) throw customersError;

      // Fetch all orders for these customers
      let ordersQuery = supabase
        .from('orders')
        .select('id, customer_id, amount, status, created_at')
        .eq('client_id', client.id);

      if (botId) {
        ordersQuery = ordersQuery.eq('bot_id', botId);
      }

      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;

      // Aggregate order data per customer
      const orderStats = orders?.reduce((acc, order) => {
        if (!order.customer_id) return acc;
        
        if (!acc[order.customer_id]) {
          acc[order.customer_id] = {
            total_orders: 0,
            total_spent: 0,
            last_order_date: null as string | null,
          };
        }
        
        acc[order.customer_id].total_orders += 1;
        
        if (order.status === 'paid' || order.status === 'delivered') {
          acc[order.customer_id].total_spent += Number(order.amount) || 0;
        }
        
        const orderDate = order.created_at;
        if (!acc[order.customer_id].last_order_date || orderDate > acc[order.customer_id].last_order_date) {
          acc[order.customer_id].last_order_date = orderDate;
        }
        
        return acc;
      }, {} as Record<string, { total_orders: number; total_spent: number; last_order_date: string | null }>);

      // Merge customer data with order stats
      let enrichedCustomers: Customer[] = customers?.map(customer => ({
        ...customer,
        total_orders: orderStats?.[customer.id]?.total_orders || 0,
        total_spent: orderStats?.[customer.id]?.total_spent || 0,
        last_order_date: orderStats?.[customer.id]?.last_order_date || null,
      })) || [];

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        enrichedCustomers = enrichedCustomers.filter(c => 
          c.first_name?.toLowerCase().includes(searchLower) ||
          c.last_name?.toLowerCase().includes(searchLower) ||
          c.telegram_username?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.phone?.includes(searchLower)
        );
      }

      if (filters.hasOrders === 'with_orders') {
        enrichedCustomers = enrichedCustomers.filter(c => c.total_orders > 0);
      } else if (filters.hasOrders === 'no_orders') {
        enrichedCustomers = enrichedCustomers.filter(c => c.total_orders === 0);
      }

      // Sort
      switch (filters.sortBy) {
        case 'recent':
          enrichedCustomers.sort((a, b) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
          break;
        case 'oldest':
          enrichedCustomers.sort((a, b) => 
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          );
          break;
        case 'most_orders':
          enrichedCustomers.sort((a, b) => b.total_orders - a.total_orders);
          break;
        case 'highest_spent':
          enrichedCustomers.sort((a, b) => b.total_spent - a.total_spent);
          break;
      }

      return enrichedCustomers;
    },
    enabled: !!client?.id,
  });
};

export const useCustomerOrders = (customerId: string | null, botId?: string | null) => {
  const clientQuery = useClient();
  const client = clientQuery.data;

  return useQuery({
    queryKey: ['customer-orders', customerId, botId],
    queryFn: async () => {
      if (!customerId || !client?.id) return [];

      let query = supabase
        .from('orders')
        .select(`
          id,
          amount,
          status,
          created_at,
          paid_at,
          delivered_at,
          is_upsell,
          is_downsell,
          products (name)
        `)
        .eq('customer_id', customerId)
        .eq('client_id', client.id);

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(order => ({
        id: order.id,
        amount: order.amount,
        status: order.status || 'pending',
        created_at: order.created_at || '',
        paid_at: order.paid_at,
        delivered_at: order.delivered_at,
        product_name: order.products?.name || null,
        is_upsell: order.is_upsell || false,
        is_downsell: order.is_downsell || false,
      })) || [];
    },
    enabled: !!customerId && !!client?.id,
  });
};
