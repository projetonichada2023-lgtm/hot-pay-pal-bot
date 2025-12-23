import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { FunnelStageData, exportToCSV } from '@/hooks/useReportsData';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface FunnelPerformanceChartProps {
  data: FunnelStageData[];
  isLoading: boolean;
}

export const FunnelPerformanceChart = ({ data, isLoading }: FunnelPerformanceChartProps) => {
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
        Etapa: d.stage,
        Quantidade: d.count,
        Valor: d.value,
        'Taxa (%)': d.rate.toFixed(1),
      })),
      'funil-performance'
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

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Performance do Funil</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Funnel visualization */}
        <div className="space-y-3">
          {data.map((stage, index) => {
            const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const isPositive = stage.rate >= 50;
            
            return (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    {index > 0 && (
                      <span className={cn(
                        "text-xs flex items-center gap-1",
                        isPositive ? "text-success" : "text-warning"
                      )}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stage.rate.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{stage.count}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatPrice(stage.value)}
                    </span>
                  </div>
                </div>
                <div className="h-8 bg-secondary/50 rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-lg transition-all duration-500",
                      index === 0 && "bg-primary",
                      index === 1 && "bg-success",
                      index === 2 && "bg-telegram",
                      index === 3 && "bg-warning",
                      index === 4 && "bg-accent"
                    )}
                    style={{ width: `${Math.max(widthPercent, 5)}%` }}
                  />
                </div>
                {index < data.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-xs text-muted-foreground mb-1">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-success">
              {data[1]?.rate.toFixed(0) || 0}%
            </p>
            <p className="text-xs text-muted-foreground">Pedidos → Pagos</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-muted-foreground mb-1">Receita Extra</p>
            <p className="text-2xl font-bold text-warning">
              {formatPrice((data[3]?.value || 0) + (data[4]?.value || 0))}
            </p>
            <p className="text-xs text-muted-foreground">Upsells + Downsells</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
