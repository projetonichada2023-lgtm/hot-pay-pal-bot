import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

interface DashboardStats {
  salesToday: number;
  salesYesterday: number;
  salesChange: number;
  ordersTotal: number;
  ordersYesterday: number;
  ordersChange: number;
  customersTotal: number;
  customersNew: number;
  conversionRate: number;
  conversionYesterday: number;
  conversionChange: number;
}

interface DailySales {
  date: string;
  total: number;
  orders: number;
}

export const useDashboardStats = (clientId: string) => {
  return useQuery({
    queryKey: ['dashboard-stats', clientId],
    queryFn: async (): Promise<DashboardStats> => {
      const today = startOfDay(new Date());
      const yesterday = startOfDay(subDays(new Date(), 1));

      // Fetch all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('amount, status, created_at')
        .eq('client_id', clientId);

      if (error) throw error;

      // Fetch customers count
      const { count: customersTotal } = await supabase
        .from('telegram_customers')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId);

      // Fetch new customers today
      const { count: customersNew } = await supabase
        .from('telegram_customers')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', today.toISOString());

      // Calculate metrics
      const todayOrders = orders?.filter(o => new Date(o.created_at!) >= today) || [];
      const yesterdayOrders = orders?.filter(o => {
        const date = new Date(o.created_at!);
        return date >= yesterday && date < today;
      }) || [];

      const paidStatuses = ['paid', 'delivered'];
      
      const salesToday = todayOrders
        .filter(o => paidStatuses.includes(o.status || ''))
        .reduce((sum, o) => sum + Number(o.amount), 0);

      const salesYesterday = yesterdayOrders
        .filter(o => paidStatuses.includes(o.status || ''))
        .reduce((sum, o) => sum + Number(o.amount), 0);

      const salesChange = salesYesterday > 0 
        ? ((salesToday - salesYesterday) / salesYesterday) * 100 
        : salesToday > 0 ? 100 : 0;

      const ordersTotal = orders?.length || 0;
      const ordersYesterday = yesterdayOrders.length;
      const ordersTodayCount = todayOrders.length;
      const ordersChange = ordersYesterday > 0
        ? ((ordersTodayCount - ordersYesterday) / ordersYesterday) * 100
        : ordersTodayCount > 0 ? 100 : 0;

      // Conversion rate
      const totalPaid = orders?.filter(o => paidStatuses.includes(o.status || '')).length || 0;
      const conversionRate = ordersTotal > 0 ? (totalPaid / ordersTotal) * 100 : 0;

      const yesterdayPaid = yesterdayOrders.filter(o => paidStatuses.includes(o.status || '')).length;
      const conversionYesterday = ordersYesterday > 0 ? (yesterdayPaid / ordersYesterday) * 100 : 0;
      const conversionChange = conversionYesterday > 0
        ? conversionRate - conversionYesterday
        : conversionRate > 0 ? conversionRate : 0;

      return {
        salesToday,
        salesYesterday,
        salesChange,
        ordersTotal,
        ordersYesterday,
        ordersChange,
        customersTotal: customersTotal || 0,
        customersNew: customersNew || 0,
        conversionRate,
        conversionYesterday,
        conversionChange,
      };
    },
    enabled: !!clientId,
  });
};

export const useSalesChart = (clientId: string) => {
  return useQuery({
    queryKey: ['sales-chart', clientId],
    queryFn: async (): Promise<DailySales[]> => {
      const days = 7;
      const startDate = startOfDay(subDays(new Date(), days - 1));

      const { data: orders, error } = await supabase
        .from('orders')
        .select('amount, status, created_at')
        .eq('client_id', clientId)
        .gte('created_at', startDate.toISOString())
        .in('status', ['paid', 'delivered']);

      if (error) throw error;

      // Group by day
      const salesByDay: Record<string, { total: number; orders: number }> = {};
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd');
        salesByDay[date] = { total: 0, orders: 0 };
      }

      orders?.forEach(order => {
        const date = format(new Date(order.created_at!), 'yyyy-MM-dd');
        if (salesByDay[date]) {
          salesByDay[date].total += Number(order.amount);
          salesByDay[date].orders += 1;
        }
      });

      return Object.entries(salesByDay).map(([date, data]) => ({
        date: format(new Date(date), 'dd/MM'),
        total: data.total,
        orders: data.orders,
      }));
    },
    enabled: !!clientId,
  });
};
