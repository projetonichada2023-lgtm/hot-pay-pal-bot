import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Users, DollarSign, Bot, CalendarIcon } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentOrdersCard } from '@/components/dashboard/RecentOrdersCard';
import { FunnelInsightsCard } from '@/components/dashboard/FunnelInsightsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OverviewPageProps {
  client: Client;
}

export const OverviewPage = ({ client }: OverviewPageProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: stats, isLoading } = useDashboardStats(client.id, selectedDate);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatChange = (value: number, isPercent = true) => {
    const sign = value >= 0 ? '+' : '';
    if (isPercent) {
      return `${sign}${value.toFixed(0)}%`;
    }
    return `${sign}${value}`;
  };

  const dateLabel = isToday(selectedDate) ? 'Hoje' : format(selectedDate, "dd 'de' MMM", { locale: ptBR });

  const statsCards = [
    { 
      label: `Vendas ${dateLabel}`, 
      value: isLoading ? null : formatPrice(stats?.salesSelected || 0),
      change: stats?.salesChange || 0,
      changeLabel: 'vs dia anterior',
      icon: DollarSign,
      color: 'text-success'
    },
    { 
      label: `Pedidos ${dateLabel}`, 
      value: isLoading ? null : String(stats?.ordersSelected || 0),
      change: stats?.ordersChange || 0,
      changeLabel: 'vs dia anterior',
      icon: ShoppingCart,
      color: 'text-primary'
    },
    { 
      label: 'Clientes', 
      value: isLoading ? null : String(stats?.customersTotal || 0),
      change: stats?.customersNew || 0,
      changeLabel: `novos ${dateLabel.toLowerCase()}`,
      isPercent: false,
      icon: Users,
      color: 'text-telegram'
    },
    { 
      label: 'Taxa de Conversão', 
      value: isLoading ? null : `${(stats?.conversionRate || 0).toFixed(0)}%`,
      change: stats?.conversionChange || 0,
      changeLabel: 'vs dia anterior',
      icon: TrendingUp,
      color: 'text-warning'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo, {client.business_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${client.webhook_configured ? 'bg-success' : 'bg-warning'}`} />
            <span className="text-muted-foreground">
              Bot {client.webhook_configured ? 'Ativo' : 'Pendente'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="glass-card hover-scale">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {stat.value === null ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={cn(
                    "text-xs",
                    stat.change >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {formatChange(stat.change, stat.isPercent !== false)} {stat.changeLabel}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <SalesChart clientId={client.id} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersCard clientId={client.id} />
        <FunnelInsightsCard clientId={client.id} />
      </div>

      {/* Quick Actions */}
      {!client.telegram_bot_token && (
        <Card className="glass-card border-warning/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Configure seu Bot</CardTitle>
                <CardDescription>
                  Para começar a vender, configure seu bot do Telegram
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acesse <strong>Bot Config</strong> no menu lateral para adicionar seu token do Telegram e configurar o webhook.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
