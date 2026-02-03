import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Trophy } from 'lucide-react';

interface TopProductsWidgetProps {
  clientId: string;
  botId?: string | null;
}

export const TopProductsWidget = ({ clientId, botId }: TopProductsWidgetProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['top-products', clientId, botId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, name, sales_count, price')
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (botId) {
        // Include products from the selected bot OR legacy products without bot assigned
        query = query.or(`bot_id.eq.${botId},bot_id.is.null`);
      }

      const { data, error } = await query
        .order('sales_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });

  const chartData = products?.map((p, index) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    vendas: p.sales_count || 0,
    revenue: (p.sales_count || 0) * Number(p.price),
    rank: index + 1,
  })) || [];

  const colors = ['hsl(24, 100%, 50%)', 'hsl(145, 65%, 40%)', 'hsl(40, 95%, 50%)', 'hsl(200, 85%, 50%)', 'hsl(350, 85%, 55%)'];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning" />
          <CardTitle className="text-base">Top Produtos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum produto vendido ainda
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-2 shadow-lg">
                        <p className="font-medium text-sm">{data.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.vendas} vendas
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="vendas" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
