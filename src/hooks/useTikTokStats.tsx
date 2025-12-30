import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TikTokCampaignStats {
  campaign: string;
  clicks: number;
  viewContent: number;
  initiateCheckout: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export interface TikTokStats {
  totalClicks: number;
  totalViewContent: number;
  totalInitiateCheckout: number;
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
          totalViewContent: 0,
          totalInitiateCheckout: 0,
          totalConversions: 0,
          totalRevenue: 0,
          conversionRate: 0,
          campaigns: [],
        };
      }

      // Get all TikTok events from the new table
      const { data: events, error } = await supabase
        .from('tiktok_events')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group stats by campaign
      const campaignStats = new Map<string, { 
        clicks: number; 
        viewContent: number;
        initiateCheckout: number;
        conversions: number; 
        revenue: number 
      }>();

      events?.forEach(event => {
        const campaign = event.utm_campaign || 'sem_campanha';
        const existing = campaignStats.get(campaign) || { 
          clicks: 0, 
          viewContent: 0,
          initiateCheckout: 0,
          conversions: 0, 
          revenue: 0 
        };

        switch (event.event_type) {
          case 'ClickButton':
            existing.clicks++;
            break;
          case 'ViewContent':
            existing.viewContent++;
            break;
          case 'InitiateCheckout':
            existing.initiateCheckout++;
            break;
          case 'CompletePayment':
            existing.conversions++;
            existing.revenue += Number(event.value) || 0;
            break;
        }

        campaignStats.set(campaign, existing);
      });

      // Convert to array and calculate rates
      const campaigns: TikTokCampaignStats[] = Array.from(campaignStats.entries())
        .map(([campaign, stats]) => ({
          campaign,
          clicks: stats.clicks,
          viewContent: stats.viewContent,
          initiateCheckout: stats.initiateCheckout,
          conversions: stats.conversions,
          revenue: stats.revenue,
          conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Calculate totals
      const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
      const totalViewContent = campaigns.reduce((sum, c) => sum + c.viewContent, 0);
      const totalInitiateCheckout = campaigns.reduce((sum, c) => sum + c.initiateCheckout, 0);
      const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
      const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      return {
        totalClicks,
        totalViewContent,
        totalInitiateCheckout,
        totalConversions,
        totalRevenue,
        conversionRate,
        campaigns,
      };
    },
    enabled: !!clientId,
  });
};