import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

interface DashboardStats {
  salesSelected: number;
  salesPrevious: number;
  salesChange: number;
  ordersSelected: number;
  ordersPrevious: number;
  ordersChange: number;
  customersTotal: number;
  customersNew: number;
  conversionRate: number;
  conversionPrevious: number;
  conversionChange: number;
}

interface DailySales {
  date: string;
  total: number;
  orders: number;
}

export const useDashboardStats = (clientId: string, selectedDate: Date = new Date()) => {
  return useQuery({
    queryKey: ['dashboard-stats', clientId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async (): Promise<DashboardStats> => {
      const selectedStart = startOfDay(selectedDate);
      const selectedEnd = endOfDay(selectedDate);
      const previousStart = startOfDay(subDays(selectedDate, 1));
      const previousEnd = endOfDay(subDays(selectedDate, 1));

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

      // Fetch new customers on selected date
      const { count: customersNew } = await supabase
        .from('telegram_customers')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', selectedStart.toISOString())
        .lte('created_at', selectedEnd.toISOString());

      // Calculate metrics
      const selectedOrders = orders?.filter(o => {
        const date = new Date(o.created_at!);
        return date >= selectedStart && date <= selectedEnd;
      }) || [];
      
      const previousOrders = orders?.filter(o => {
        const date = new Date(o.created_at!);
        return date >= previousStart && date <= previousEnd;
      }) || [];

      const paidStatuses = ['paid', 'delivered'];
      
      const salesSelected = selectedOrders
        .filter(o => paidStatuses.includes(o.status || ''))
        .reduce((sum, o) => sum + Number(o.amount), 0);

      const salesPrevious = previousOrders
        .filter(o => paidStatuses.includes(o.status || ''))
        .reduce((sum, o) => sum + Number(o.amount), 0);

      const salesChange = salesPrevious > 0
        ? ((salesSelected - salesPrevious) / salesPrevious) * 100 
        : salesSelected > 0 ? 100 : 0;

      const ordersSelected = selectedOrders.length;
      const ordersPrevious = previousOrders.length;
      const ordersChange = ordersPrevious > 0
        ? ((ordersSelected - ordersPrevious) / ordersPrevious) * 100
        : ordersSelected > 0 ? 100 : 0;

      // Conversion rate for selected date
      const selectedPaid = selectedOrders.filter(o => paidStatuses.includes(o.status || '')).length;
      const conversionRate = ordersSelected > 0 ? (selectedPaid / ordersSelected) * 100 : 0;

      const previousPaid = previousOrders.filter(o => paidStatuses.includes(o.status || '')).length;
      const conversionPrevious = ordersPrevious > 0 ? (previousPaid / ordersPrevious) * 100 : 0;
      const conversionChange = conversionPrevious > 0
        ? conversionRate - conversionPrevious
        : conversionRate > 0 ? conversionRate : 0;

      return {
        salesSelected,
        salesPrevious,
        salesChange,
        ordersSelected,
        ordersPrevious,
        ordersChange,
        customersTotal: customersTotal || 0,
        customersNew: customersNew || 0,
        conversionRate,
        conversionPrevious,
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
