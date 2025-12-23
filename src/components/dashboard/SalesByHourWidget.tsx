import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock } from 'lucide-react';

interface SalesByHourWidgetProps {
  clientId: string;
}

export const SalesByHourWidget = ({ clientId }: SalesByHourWidgetProps) => {
  const { data: hourlyData, isLoading } = useQuery({
    queryKey: ['sales-by-hour', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, amount, status')
        .eq('client_id', clientId)
        .in('status', ['paid', 'delivered']);

      if (error) throw error;

      // Initialize all hours with 0
      const hourCounts: Record<number, { count: number; value: number }> = {};
      for (let i = 0; i < 24; i++) {
        hourCounts[i] = { count: 0, value: 0 };
      }

      // Aggregate by hour
      data?.forEach((order) => {
        if (order.created_at) {
          const hour = new Date(order.created_at).getHours();
          hourCounts[hour].count++;
          hourCounts[hour].value += Number(order.amount);
        }
      });

      return Object.entries(hourCounts).map(([hour, data]) => ({
        hour: `${hour.padStart(2, '0')}h`,
        vendas: data.count,
        valor: data.value,
      }));
    },
    enabled: !!clientId,
  });

  const maxVendas = Math.max(...(hourlyData?.map(d => d.vendas) || [0]));
  const peakHour = hourlyData?.find(d => d.vendas === maxVendas)?.hour;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <CardTitle className="text-base">Vendas por Hora</CardTitle>
          </div>
          {peakHour && maxVendas > 0 && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
              Pico: {peakHour}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : !hourlyData || hourlyData.every(d => d.vendas === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma venda registrada
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} margin={{ left: -20, right: 0 }}>
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-2 shadow-lg">
                        <p className="font-medium text-sm">{data.hour}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.vendas} vendas
                        </p>
                        <p className="text-xs text-muted-foreground">
                          R$ {data.valor.toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="vendas" 
                fill="hsl(var(--accent))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
