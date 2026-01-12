import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSalesChart, DateRange } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesChartProps {
  clientId: string;
  dateRange: DateRange;
  botId?: string | null;
}

export const SalesChart = ({ clientId, dateRange, botId }: SalesChartProps) => {
  const { data: chartData, isLoading } = useSalesChart(clientId, dateRange, botId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="widget-card">
        <div className="p-6 pb-2">
          <h3 className="text-lg font-semibold">Vendas no Período</h3>
        </div>
        <div className="p-6 pt-0">
          <Skeleton className="h-[240px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="widget-card">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Vendas no Período</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-primary/80" />
            <span>Receita</span>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px hsl(var(--foreground) / 0.1)',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
