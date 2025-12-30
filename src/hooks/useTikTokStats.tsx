import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TikTokCampaignStats {
  campaign: string;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export interface TikTokStats {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  campaigns: TikTokCampaignStats[];
}

export const useTikTokStats = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['tiktok-stats', clientId],
    queryFn: async (): Promise<TikTokStats> => {
      if (!clientId) {
        return {
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          conversionRate: 0,
          campaigns: [],
        };
      }

      // Get all TikTok customers (clicks)
      const { data: tiktokCustomers, error: customersError } = await supabase
        .from('telegram_customers')
        .select('id, utm_campaign, created_at')
        .eq('client_id', clientId)
        .eq('utm_source', 'tiktok');

      if (customersError) throw customersError;

      const customerIds = tiktokCustomers?.map(c => c.id) || [];

      // Get paid orders from TikTok customers
      let paidOrders: any[] = [];
      if (customerIds.length > 0) {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, customer_id, amount, paid_at')
          .eq('client_id', clientId)
          .eq('status', 'paid')
          .in('customer_id', customerIds);

        if (ordersError) throw ordersError;
        paidOrders = orders || [];
      }

      // Create customer lookup for campaign
      const customerCampaignMap = new Map<string, string>();
      tiktokCustomers?.forEach(c => {
        customerCampaignMap.set(c.id, c.utm_campaign || 'sem_campanha');
      });

      // Group stats by campaign
      const campaignStats = new Map<string, { clicks: number; conversions: number; revenue: number }>();

      // Count clicks per campaign
      tiktokCustomers?.forEach(customer => {
        const campaign = customer.utm_campaign || 'sem_campanha';
        const existing = campaignStats.get(campaign) || { clicks: 0, conversions: 0, revenue: 0 };
        existing.clicks++;
        campaignStats.set(campaign, existing);
      });

      // Count conversions and revenue per campaign
      paidOrders.forEach(order => {
        const campaign = customerCampaignMap.get(order.customer_id) || 'sem_campanha';
        const existing = campaignStats.get(campaign) || { clicks: 0, conversions: 0, revenue: 0 };
        existing.conversions++;
        existing.revenue += Number(order.amount) || 0;
        campaignStats.set(campaign, existing);
      });

      // Convert to array and calculate rates
      const campaigns: TikTokCampaignStats[] = Array.from(campaignStats.entries())
        .map(([campaign, stats]) => ({
          campaign,
          clicks: stats.clicks,
          conversions: stats.conversions,
          revenue: stats.revenue,
          conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Calculate totals
      const totalClicks = tiktokCustomers?.length || 0;
      const totalConversions = paidOrders.length;
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      return {
        totalClicks,
        totalConversions,
        totalRevenue,
        conversionRate,
        campaigns,
      };
    },
    enabled: !!clientId,
  });
};
