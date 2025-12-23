import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Users, DollarSign, Bot, CalendarIcon, Receipt, AlertCircle, UserCheck, CheckCircle } from 'lucide-react';
import { useDashboardStats, DateRange } from '@/hooks/useDashboardStats';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentOrdersCard } from '@/components/dashboard/RecentOrdersCard';
import { FunnelInsightsCard } from '@/components/dashboard/FunnelInsightsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OverviewPageProps {
  client: Client;
}

const presetRanges = [
  { label: 'Hoje', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
];

export const OverviewPage = ({ client }: OverviewPageProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [activePreset, setActivePreset] = useState<number | null>(1);
  
  const { data: stats, isLoading } = useDashboardStats(client.id, dateRange);

  const handlePresetClick = (days: number) => {
    const to = new Date();
    const from = days === 1 ? to : subDays(to, days - 1);
    setDateRange({ from, to });
    setActivePreset(days);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      setDateRange({
        from: range.from,
        to: range.to || range.from,
      });
      setActivePreset(null);
    }
  };

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

  const statsCards = [
    { 
      label: 'Pedidos Pagos', 
      value: isLoading ? null : String(stats?.paidOrdersCount || 0),
      change: stats?.paidOrdersChange || 0,
      changeLabel: 'vs período anterior',
      icon: CheckCircle,
      color: 'text-success'
    },
    { 
      label: 'Valor Pago', 
      value: isLoading ? null : formatPrice(stats?.salesTotal || 0),
      change: stats?.salesChange || 0,
      changeLabel: 'vs período anterior',
      icon: DollarSign,
      color: 'text-success'
    },
    { 
      label: 'Total Pedidos', 
      value: isLoading ? null : String(stats?.ordersTotal || 0),
      change: stats?.ordersChange || 0,
      changeLabel: 'vs período anterior',
      icon: ShoppingCart,
      color: 'text-primary'
    },
    { 
      label: 'Clientes', 
      value: isLoading ? null : String(stats?.customersTotal || 0),
      change: stats?.customersNew || 0,
      changeLabel: 'novos no período',
      isPercent: false,
      icon: Users,
      color: 'text-telegram'
    },
    { 
      label: 'Taxa de Conversão', 
      value: isLoading ? null : `${(stats?.conversionRate || 0).toFixed(0)}%`,
      change: stats?.conversionChange || 0,
      changeLabel: 'vs período anterior',
      icon: TrendingUp,
      color: 'text-warning'
    },
    { 
      label: 'Ticket Médio', 
      value: isLoading ? null : formatPrice(stats?.averageTicket || 0),
      change: stats?.averageTicketChange || 0,
      changeLabel: 'vs período anterior',
      icon: Receipt,
      color: 'text-primary'
    },
    { 
      label: 'Taxa de Abandono', 
      value: isLoading ? null : `${(stats?.abandonmentRate || 0).toFixed(0)}%`,
      change: stats?.abandonmentRateChange || 0,
      changeLabel: 'vs período anterior',
      invertColors: true,
      icon: AlertCircle,
      color: 'text-destructive'
    },
    { 
      label: 'Clientes Recorrentes', 
      value: isLoading ? null : String(stats?.recurringCustomers || 0),
      change: stats?.recurringCustomersChange || 0,
      changeLabel: 'novos no período',
      isPercent: false,
      icon: UserCheck,
      color: 'text-success'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Bem-vindo, {client.business_name}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm mr-14">
            <div className={`w-2 h-2 rounded-full ${client.webhook_configured ? 'bg-success' : 'bg-warning'}`} />
            <span className="text-muted-foreground">
              Bot {client.webhook_configured ? 'Ativo' : 'Pendente'}
            </span>
          </div>
        </div>
        
        {/* Date filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {presetRanges.map((preset) => (
              <Button
                key={preset.days}
                variant={activePreset === preset.days ? 'default' : 'outline'}
                size="sm"
                className="text-xs sm:text-sm"
                onClick={() => handlePresetClick(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">
                  {format(dateRange.from, "dd/MM")} - {format(dateRange.to, "dd/MM/yy")}
                </span>
                <span className="xs:hidden">Período</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => handleDateRangeChange(range || {})}
                disabled={(date) => date > new Date()}
                numberOfMonths={1}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats-cards">
        {statsCards.map((stat) => {
          const isPositive = stat.invertColors ? stat.change <= 0 : stat.change >= 0;
          return (
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
                      isPositive ? "text-success" : "text-destructive"
                    )}>
                      {formatChange(stat.change, stat.isPercent !== false)} {stat.changeLabel}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <div data-tour="sales-chart">
        <SalesChart clientId={client.id} dateRange={dateRange} />
      </div>

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
