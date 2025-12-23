import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStats {
  productId: string;
  productName: string;
  totalSales: number;
  upsellOffered: number;
  upsellAccepted: number;
  upsellRate: number;
  downsellOffered: number;
  downsellAccepted: number;
  downsellRate: number;
  totalUpsellRevenue: number;
  totalDownsellRevenue: number;
}

interface GlobalStats {
  totalUpsellOffers: number;
  totalUpsellAccepted: number;
  totalUpsellRate: number;
  totalDownsellOffers: number;
  totalDownsellAccepted: number;
  totalDownsellRate: number;
  totalAdditionalRevenue: number;
}

export const useFunnelStats = (clientId: string) => {
  return useQuery({
    queryKey: ['funnel-stats', clientId],
    queryFn: async () => {
      // Get all orders with their parent orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          product_id,
          status,
          amount,
          is_upsell,
          is_downsell,
          parent_order_id
        `)
        .eq('client_id', clientId);

      if (error) throw error;

      // Get products for names
      const { data: products } = await supabase
        .from('products')
        .select('id, name, upsell_product_id, downsell_product_id')
        .eq('client_id', clientId);

      const productMap = new Map(products?.map(p => [p.id, p]) || []);

      // Calculate stats
      const paidOrders = orders?.filter(o => o.status === 'paid' || o.status === 'delivered') || [];
      
      // Parent orders that triggered upsell/downsell offers
      const ordersWithUpsellConfig = paidOrders.filter(o => {
        const product = productMap.get(o.product_id || '');
        return product?.upsell_product_id && !o.is_upsell && !o.is_downsell;
      });

      // Count upsell offers (orders where the product has upsell configured)
      const upsellOffers = ordersWithUpsellConfig.length;
      
      // Count accepted upsells
      const upsellOrders = orders?.filter(o => o.is_upsell && (o.status === 'paid' || o.status === 'delivered')) || [];
      const upsellAccepted = upsellOrders.length;
      
      // Count downsell offers (when upsell was declined - approximated by: has downsell config but no upsell accepted)
      const ordersWithDownsellConfig = ordersWithUpsellConfig.filter(o => {
        const product = productMap.get(o.product_id || '');
        return product?.downsell_product_id;
      });
      
      // For downsell offers, we count parent orders that have downsell config minus those that accepted upsell
      const parentOrdersWithAcceptedUpsell = new Set(upsellOrders.map(o => o.parent_order_id));
      const downsellOffers = ordersWithDownsellConfig.filter(o => !parentOrdersWithAcceptedUpsell.has(o.id)).length;
      
      // Count accepted downsells
      const downsellOrders = orders?.filter(o => o.is_downsell && (o.status === 'paid' || o.status === 'delivered')) || [];
      const downsellAccepted = downsellOrders.length;

      // Calculate revenue
      const upsellRevenue = upsellOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      const downsellRevenue = downsellOrders.reduce((sum, o) => sum + Number(o.amount), 0);

      const globalStats: GlobalStats = {
        totalUpsellOffers: upsellOffers,
        totalUpsellAccepted: upsellAccepted,
        totalUpsellRate: upsellOffers > 0 ? (upsellAccepted / upsellOffers) * 100 : 0,
        totalDownsellOffers: downsellOffers,
        totalDownsellAccepted: downsellAccepted,
        totalDownsellRate: downsellOffers > 0 ? (downsellAccepted / downsellOffers) * 100 : 0,
        totalAdditionalRevenue: upsellRevenue + downsellRevenue,
      };

      return globalStats;
    },
    enabled: !!clientId,
  });
};
