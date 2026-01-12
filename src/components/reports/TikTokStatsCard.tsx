import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTikTokStats } from '@/hooks/useTikTokStats';
import { BarChart3, MousePointerClick, ShoppingCart, DollarSign, TrendingUp, Eye, CreditCard } from 'lucide-react';

interface TikTokStatsCardProps {
  clientId: string | undefined;
  botId?: string | null;
}

export const TikTokStatsCard = ({ clientId, botId }: TikTokStatsCardProps) => {
  const { data: stats, isLoading } = useTikTokStats(clientId, botId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 w-full bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = stats && (stats.totalClicks > 0 || stats.totalViewContent > 0 || stats.totalConversions > 0);

  if (!hasData) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            TikTok Ads
          </CardTitle>
          <CardDescription>
            Estatísticas de conversão do TikTok Ads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum dado do TikTok ainda.</p>
            <p className="text-sm mt-1">
              Configure o pixel em Configurações → Tracking e use o deep link nas suas campanhas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          TikTok Ads
        </CardTitle>
        <CardDescription>
          Estatísticas de conversão do TikTok Ads - Funil Completo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MousePointerClick className="w-4 h-4" />
              <span className="text-sm">Cliques</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalClicks || 0}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Visualizações</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats?.totalViewContent || 0}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Checkout</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{stats?.totalInitiateCheckout || 0}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Vendas</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats?.totalConversions || 0}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Receita</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats?.totalRevenue || 0)}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Taxa Conv.</span>
            </div>
            <p className="text-2xl font-bold">{(stats?.conversionRate || 0).toFixed(1)}%</p>
          </div>
        </div>

        {/* Campaign Table */}
        {stats?.campaigns && stats.campaigns.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Por Campanha</h4>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Checkout</TableHead>
                    <TableHead className="text-right">Vendas</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.campaigns.map((campaign) => (
                    <TableRow key={campaign.campaign}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {campaign.campaign}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{campaign.clicks}</TableCell>
                      <TableCell className="text-right text-blue-500">{campaign.viewContent}</TableCell>
                      <TableCell className="text-right text-yellow-500">{campaign.initiateCheckout}</TableCell>
                      <TableCell className="text-right text-green-500 font-medium">
                        {campaign.conversions}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.conversionRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(campaign.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};