import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TopProduct, exportToCSV } from '@/hooks/useReportsData';
import { Skeleton } from '@/components/ui/skeleton';

interface TopProductsChartProps {
  data: TopProduct[];
  isLoading: boolean;
}

const COLORS = [
  'hsl(24, 100%, 55%)',
  'hsl(350, 85%, 55%)',
  'hsl(145, 65%, 45%)',
  'hsl(200, 85%, 50%)',
  'hsl(40, 95%, 55%)',
  'hsl(280, 70%, 55%)',
  'hsl(180, 70%, 45%)',
  'hsl(60, 70%, 50%)',
  'hsl(320, 70%, 55%)',
  'hsl(100, 60%, 45%)',
];

export const TopProductsChart = ({ data, isLoading }: TopProductsChartProps) => {
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
        Produto: d.name,
        Vendas: d.sales,
        Receita: d.revenue,
        'Taxa de Conversão (%)': d.conversionRate.toFixed(1),
      })),
      'produtos-top'
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

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma venda no período</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" horizontal={true} vertical={false} />
              <XAxis 
                type="number"
                stroke="hsl(220, 10%, 60%)" 
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => formatPrice(value)}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="hsl(220, 10%, 60%)" 
                fontSize={11}
                tickLine={false}
                width={100}
                tick={{ fill: 'hsl(0, 0%, 98%)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 15%, 18%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return [formatPrice(value), 'Receita'];
                  return [value, name];
                }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products table */}
        <div className="mt-6 space-y-2">
          {data.slice(0, 5).map((product, index) => (
            <div 
              key={product.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: COLORS[index % COLORS.length] + '20', color: COLORS[index % COLORS.length] }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} vendas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success">{formatPrice(product.revenue)}</p>
                <p className="text-xs text-muted-foreground">{product.conversionRate.toFixed(1)}% conv.</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
