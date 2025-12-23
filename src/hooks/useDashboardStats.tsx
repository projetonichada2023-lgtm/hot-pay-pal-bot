import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DashboardStats {
  salesTotal: number;
  salesPrevious: number;
  salesChange: number;
  ordersTotal: number;
  ordersPrevious: number;
  ordersChange: number;
  paidOrdersCount: number;
  paidOrdersPrevious: number;
  paidOrdersChange: number;
  customersTotal: number;
  customersNew: number;
  conversionRate: number;
  conversionPrevious: number;
  conversionChange: number;
  averageTicket: number;
  averageTicketPrevious: number;
  averageTicketChange: number;
  abandonmentRate: number;
  abandonmentRatePrevious: number;
  abandonmentRateChange: number;
  recurringCustomers: number;
  recurringCustomersChange: number;
}

interface DailySales {
  date: string;
  total: number;
  orders: number;
}

const getDaysDiff = (from: Date, to: Date) => {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export const useDashboardStats = (clientId: string, dateRange: DateRange) => {
  const rangeKey = `${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`;
  
  return useQuery({
    queryKey: ['dashboard-stats', clientId, rangeKey],
    queryFn: async (): Promise<DashboardStats> => {
      const selectedStart = startOfDay(dateRange.from);
      const selectedEnd = endOfDay(dateRange.to);
      
      // Calculate previous period with same duration
      const daysDiff = getDaysDiff(dateRange.from, dateRange.to);
      const previousStart = startOfDay(subDays(dateRange.from, daysDiff));
      const previousEnd = endOfDay(subDays(dateRange.from, 1));

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

      // Fetch new customers in selected range
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
      
      const salesTotal = selectedOrders
        .filter(o => paidStatuses.includes(o.status || ''))
        .reduce((sum, o) => sum + Number(o.amount), 0);

      const salesPrevious = previousOrders
        .filter(o => paidStatuses.includes(o.status || ''))
        .reduce((sum, o) => sum + Number(o.amount), 0);

      const salesChange = salesPrevious > 0 
        ? ((salesTotal - salesPrevious) / salesPrevious) * 100 
        : salesTotal > 0 ? 100 : 0;

      const ordersTotal = selectedOrders.length;
      const ordersPrevious = previousOrders.length;
      const ordersChange = ordersPrevious > 0
        ? ((ordersTotal - ordersPrevious) / ordersPrevious) * 100
        : ordersTotal > 0 ? 100 : 0;

      // Paid orders count
      const selectedPaid = selectedOrders.filter(o => paidStatuses.includes(o.status || '')).length;
      const previousPaid = previousOrders.filter(o => paidStatuses.includes(o.status || '')).length;
      const paidOrdersChange = previousPaid > 0
        ? ((selectedPaid - previousPaid) / previousPaid) * 100
        : selectedPaid > 0 ? 100 : 0;

      // Conversion rate for selected period
      const conversionRate = ordersTotal > 0 ? (selectedPaid / ordersTotal) * 100 : 0;
      const conversionPrevious = ordersPrevious > 0 ? (previousPaid / ordersPrevious) * 100 : 0;
      const conversionChange = conversionPrevious > 0
        ? conversionRate - conversionPrevious
        : conversionRate > 0 ? conversionRate : 0;

      // Average ticket
      const averageTicket = selectedPaid > 0 ? salesTotal / selectedPaid : 0;
      const averageTicketPrevious = previousPaid > 0 ? salesPrevious / previousPaid : 0;
      const averageTicketChange = averageTicketPrevious > 0
        ? ((averageTicket - averageTicketPrevious) / averageTicketPrevious) * 100
        : averageTicket > 0 ? 100 : 0;

      // Abandonment rate (pending orders / total orders)
      const pendingOrders = selectedOrders.filter(o => o.status === 'pending').length;
      const abandonmentRate = ordersTotal > 0 ? (pendingOrders / ordersTotal) * 100 : 0;
      const previousPending = previousOrders.filter(o => o.status === 'pending').length;
      const abandonmentRatePrevious = ordersPrevious > 0 ? (previousPending / ordersPrevious) * 100 : 0;
      const abandonmentRateChange = abandonmentRatePrevious > 0
        ? abandonmentRate - abandonmentRatePrevious
        : abandonmentRate > 0 ? abandonmentRate : 0;

      // Recurring customers (customers with more than 1 order in the period)
      const { data: allOrders } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('client_id', clientId)
        .in('status', ['paid', 'delivered'] as const);

      const customerOrderCount: Record<string, number> = {};
      allOrders?.forEach(o => {
        if (o.customer_id) {
          customerOrderCount[o.customer_id] = (customerOrderCount[o.customer_id] || 0) + 1;
        }
      });
      const recurringCustomers = Object.values(customerOrderCount).filter(count => count > 1).length;
      const recurringCustomersChange = customersNew || 0;

      return {
        salesTotal,
        salesPrevious,
        salesChange,
        ordersTotal,
        ordersPrevious,
        ordersChange,
        paidOrdersCount: selectedPaid,
        paidOrdersPrevious: previousPaid,
        paidOrdersChange,
        customersTotal: customersTotal || 0,
        customersNew: customersNew || 0,
        conversionRate,
        conversionPrevious,
        conversionChange,
        averageTicket,
        averageTicketPrevious,
        averageTicketChange,
        abandonmentRate,
        abandonmentRatePrevious,
        abandonmentRateChange,
        recurringCustomers,
        recurringCustomersChange,
      };
    },
    enabled: !!clientId,
  });
};

export const useSalesChart = (clientId: string, dateRange: DateRange) => {
  const rangeKey = `${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`;
  
  return useQuery({
    queryKey: ['sales-chart', clientId, rangeKey],
    queryFn: async (): Promise<DailySales[]> => {
      const startDate = startOfDay(dateRange.from);
      const endDate = endOfDay(dateRange.to);
      const daysDiff = getDaysDiff(dateRange.from, dateRange.to);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('amount, status, created_at')
        .eq('client_id', clientId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('status', ['paid', 'delivered']);

      if (error) throw error;

      // Group by day
      const salesByDay: Record<string, { total: number; orders: number }> = {};
      
      for (let i = 0; i < daysDiff; i++) {
        const date = format(subDays(dateRange.to, daysDiff - 1 - i), 'yyyy-MM-dd');
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
