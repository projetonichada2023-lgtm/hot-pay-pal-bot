import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/hooks/useDashboardStats';
import { format, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';

export interface DailySalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  value: number;
  rate: number;
}

export const useReportsData = (clientId: string, dateRange: DateRange, botId?: string | null) => {
  // Sales over time
  const salesQuery = useQuery({
    queryKey: ['reports-sales', clientId, dateRange.from, dateRange.to, botId],
    queryFn: async (): Promise<DailySalesData[]> => {
      let query = supabase
        .from('orders')
        .select('amount, status, created_at')
        .eq('client_id', clientId)
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString())
        .in('status', ['paid', 'delivered']);

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const salesByDay: Record<string, { sales: number; orders: number }> = {};

      days.forEach(day => {
        const key = format(day, 'yyyy-MM-dd');
        salesByDay[key] = { sales: 0, orders: 0 };
      });

      data?.forEach(order => {
        const key = format(new Date(order.created_at), 'yyyy-MM-dd');
        if (salesByDay[key]) {
          salesByDay[key].sales += Number(order.amount);
          salesByDay[key].orders += 1;
        }
      });

      return days.map(day => ({
        date: format(day, 'dd/MM'),
        sales: salesByDay[format(day, 'yyyy-MM-dd')].sales,
        orders: salesByDay[format(day, 'yyyy-MM-dd')].orders,
      }));
    },
    enabled: !!clientId,
  });

  // Top products
  const topProductsQuery = useQuery({
    queryKey: ['reports-top-products', clientId, dateRange.from, dateRange.to, botId],
    queryFn: async (): Promise<TopProduct[]> => {
      let ordersQuery = supabase
        .from('orders')
        .select('product_id, amount, status')
        .eq('client_id', clientId)
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString());

      if (botId) {
        ordersQuery = ordersQuery.eq('bot_id', botId);
      }

      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;

      let productsQuery = supabase
        .from('products')
        .select('id, name, views_count')
        .eq('client_id', clientId);

      if (botId) {
        productsQuery = productsQuery.eq('bot_id', botId);
      }

      const { data: products, error: productsError } = await productsQuery;

      if (productsError) throw productsError;

      const productStats: Record<string, { sales: number; revenue: number; views: number }> = {};

      products?.forEach(product => {
        productStats[product.id] = { sales: 0, revenue: 0, views: product.views_count || 0 };
      });

      orders?.forEach(order => {
        if (order.product_id && productStats[order.product_id]) {
          if (order.status === 'paid' || order.status === 'delivered') {
            productStats[order.product_id].sales += 1;
            productStats[order.product_id].revenue += Number(order.amount);
          }
        }
      });

      return products
        ?.map(product => ({
          id: product.id,
          name: product.name,
          sales: productStats[product.id]?.sales || 0,
          revenue: productStats[product.id]?.revenue || 0,
          conversionRate: productStats[product.id]?.views > 0
            ? (productStats[product.id].sales / productStats[product.id].views) * 100
            : 0,
        }))
        .filter(p => p.sales > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10) || [];
    },
    enabled: !!clientId,
  });

  // Funnel performance
  const funnelQuery = useQuery({
    queryKey: ['reports-funnel', clientId, dateRange.from, dateRange.to, botId],
    queryFn: async (): Promise<FunnelStageData[]> => {
      let query = supabase
        .from('orders')
        .select('status, amount, is_upsell, is_downsell')
        .eq('client_id', clientId)
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString());

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const paidOrders = orders?.filter(o => o.status === 'paid' || o.status === 'delivered') || [];
      const deliveredOrders = orders?.filter(o => o.status === 'delivered') || [];
      const upsells = orders?.filter(o => o.is_upsell && (o.status === 'paid' || o.status === 'delivered')) || [];
      const downsells = orders?.filter(o => o.is_downsell && (o.status === 'paid' || o.status === 'delivered')) || [];

      return [
        {
          stage: 'Pedidos Criados',
          count: totalOrders,
          value: orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0,
          rate: 100,
        },
        {
          stage: 'Pagos',
          count: paidOrders.length,
          value: paidOrders.reduce((sum, o) => sum + Number(o.amount), 0),
          rate: totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0,
        },
        {
          stage: 'Entregues',
          count: deliveredOrders.length,
          value: deliveredOrders.reduce((sum, o) => sum + Number(o.amount), 0),
          rate: paidOrders.length > 0 ? (deliveredOrders.length / paidOrders.length) * 100 : 0,
        },
        {
          stage: 'Upsells Aceitos',
          count: upsells.length,
          value: upsells.reduce((sum, o) => sum + Number(o.amount), 0),
          rate: paidOrders.length > 0 ? (upsells.length / paidOrders.length) * 100 : 0,
        },
        {
          stage: 'Downsells Aceitos',
          count: downsells.length,
          value: downsells.reduce((sum, o) => sum + Number(o.amount), 0),
          rate: paidOrders.length > 0 ? (downsells.length / paidOrders.length) * 100 : 0,
        },
      ];
    },
    enabled: !!clientId,
  });

  return {
    salesData: salesQuery.data || [],
    topProducts: topProductsQuery.data || [],
    funnelData: funnelQuery.data || [],
    isLoading: salesQuery.isLoading || topProductsQuery.isLoading || funnelQuery.isLoading,
  };
};

// CSV Export utility
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
};
