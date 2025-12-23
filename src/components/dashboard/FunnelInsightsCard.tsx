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
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance do Funil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
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
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance do Funil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div key={insight.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${insight.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{insight.label}</p>
                    <p className="text-xs text-muted-foreground">{insight.detail}</p>
                  </div>
                </div>
                <span className={`font-bold ${insight.color}`}>{insight.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
