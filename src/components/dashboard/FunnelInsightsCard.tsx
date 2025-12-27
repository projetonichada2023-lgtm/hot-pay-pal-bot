import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunnelStats } from '@/hooks/useFunnelStats';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

interface FunnelInsightsCardProps {
  clientId: string;
}

export const FunnelInsightsCard = ({ clientId }: FunnelInsightsCardProps) => {
  const { data: stats, isLoading } = useFunnelStats(clientId);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <div className="widget-card">
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-base font-semibold">Performance do Funil</h3>
        </div>
        <div className="px-6 pb-6">
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const insights = [
    {
      label: 'Upsells',
      value: formatPercent(stats?.totalUpsellRate || 0),
      detail: `${stats?.totalUpsellAccepted || 0}/${stats?.totalUpsellOffers || 0}`,
      icon: ArrowUpRight,
      color: 'text-success',
    },
    {
      label: 'Downsells',
      value: formatPercent(stats?.totalDownsellRate || 0),
      detail: `${stats?.totalDownsellAccepted || 0}/${stats?.totalDownsellOffers || 0}`,
      icon: ArrowDownRight,
      color: 'text-warning',
    },
    {
      label: 'Receita Extra',
      value: formatPrice(stats?.totalAdditionalRevenue || 0),
      detail: 'via upsells/downsells',
      icon: DollarSign,
      color: 'text-primary',
    },
  ];

  return (
    <div className="widget-card">
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-base font-semibold">Performance do Funil</h3>
      </div>
      <div className="px-6 pb-6 space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div 
              key={insight.label} 
              className="flex items-center justify-between p-3 rounded-xl bg-muted/30 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{insight.label}</p>
                  <p className="text-xs text-muted-foreground">{insight.detail}</p>
                </div>
              </div>
              <span className={`font-bold text-lg ${insight.color}`}>{insight.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
