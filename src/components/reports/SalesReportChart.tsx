import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DailySalesData, exportToCSV } from '@/hooks/useReportsData';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesReportChartProps {
  data: DailySalesData[];
  isLoading: boolean;
}

export const SalesReportChart = ({ data, isLoading }: SalesReportChartProps) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = () => {
    exportToCSV(
      data.map(d => ({
        Data: d.date,
        Vendas: d.sales,
        Pedidos: d.orders,
      })),
      'vendas'
    );
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Vendas ao Longo do Tempo</CardTitle>
          <div className="flex gap-4 mt-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold text-success">{formatPrice(totalSales)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Pedidos: </span>
              <span className="font-semibold">{totalOrders}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(145, 65%, 45%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(145, 65%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(220, 10%, 60%)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(220, 10%, 60%)" 
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => formatPrice(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 15%, 18%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatPrice(value), 'Vendas']}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(145, 65%, 45%)"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders bar chart */}
        <div className="h-[150px] w-full mt-6">
          <p className="text-sm text-muted-foreground mb-2">Pedidos por Dia</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(220, 10%, 60%)" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(220, 10%, 60%)" 
                fontSize={10}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 15%, 18%)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="orders" fill="hsl(24, 100%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
