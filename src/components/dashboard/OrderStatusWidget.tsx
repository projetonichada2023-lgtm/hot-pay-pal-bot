import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChartIcon } from 'lucide-react';

interface OrderStatusWidgetProps {
  clientId: string;
  botId?: string | null;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'hsl(40, 95%, 50%)' },
  paid: { label: 'Pago', color: 'hsl(145, 65%, 40%)' },
  delivered: { label: 'Entregue', color: 'hsl(200, 85%, 50%)' },
  cancelled: { label: 'Cancelado', color: 'hsl(0, 84%, 60%)' },
  refunded: { label: 'Reembolsado', color: 'hsl(220, 15%, 50%)' },
};

export const OrderStatusWidget = ({ clientId, botId }: OrderStatusWidgetProps) => {
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['order-status-distribution', clientId, botId],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('status')
        .eq('client_id', clientId);

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const counts: Record<string, number> = {
        pending: 0,
        paid: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
      };

      data?.forEach((order) => {
        if (order.status && counts[order.status] !== undefined) {
          counts[order.status]++;
        }
      });

      return Object.entries(counts)
        .filter(([_, value]) => value > 0)
        .map(([status, value]) => ({
          name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
          value,
          color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || '#888',
        }));
    },
    enabled: !!clientId,
  });

  const total = statusData?.reduce((sum, item) => sum + item.value, 0) || 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Status dos Pedidos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </div>
        ) : !statusData || statusData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum pedido registrado
          </p>
        ) : (
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percent = ((data.value / total) * 100).toFixed(0);
                      return (
                        <div className="bg-popover border rounded-lg p-2 shadow-lg">
                          <p className="font-medium text-sm">{data.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {data.value} pedidos ({percent}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
