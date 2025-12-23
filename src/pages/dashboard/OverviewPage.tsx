import { useState, useMemo } from 'react';
import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, ShoppingCart, DollarSign, Bot, CalendarIcon, Receipt, 
  Users, UserCheck, AlertCircle, CheckCircle 
} from 'lucide-react';
import { useDashboardStats, DateRange } from '@/hooks/useDashboardStats';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentOrdersCard } from '@/components/dashboard/RecentOrdersCard';
import { FunnelInsightsCard } from '@/components/dashboard/FunnelInsightsCard';
import { CustomizeDashboardDialog } from '@/components/dashboard/CustomizeDashboardDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays } from 'date-fns';
import { LucideIcon } from 'lucide-react';

interface OverviewPageProps {
  client: Client;
}

interface MetricDefinition {
  id: string;
  label: string;
  getValue: (stats: any, formatPrice: (v: number) => string) => string | null;
  getChange: (stats: any) => number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  iconColor: string;
  invertColors?: boolean;
}

const presetRanges = [
  { label: 'Hoje', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
];

const METRIC_DEFINITIONS: MetricDefinition[] = [
  { 
    id: 'ordersTotal',
    label: 'Total Pedidos', 
    getValue: (stats) => String(stats?.ordersTotal || 0),
    getChange: (stats) => stats?.ordersChange || 0,
    icon: ShoppingCart,
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary'
  },
  { 
    id: 'salesTotal',
    label: 'Receita Total', 
    getValue: (stats, formatPrice) => formatPrice(stats?.salesTotal || 0),
    getChange: (stats) => stats?.salesChange || 0,
    icon: DollarSign,
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success'
  },
  { 
    id: 'conversionRate',
    label: 'Taxa de Conversão', 
    getValue: (stats) => `${(stats?.conversionRate || 0).toFixed(1)}%`,
    getChange: (stats) => stats?.conversionChange || 0,
    icon: TrendingUp,
    gradient: 'from-warning/20 to-warning/5',
    iconBg: 'bg-warning/20',
    iconColor: 'text-warning'
  },
  { 
    id: 'averageTicket',
    label: 'Ticket Médio', 
    getValue: (stats, formatPrice) => formatPrice(stats?.averageTicket || 0),
    getChange: (stats) => stats?.averageTicketChange || 0,
    icon: Receipt,
    gradient: 'from-accent/20 to-accent/5',
    iconBg: 'bg-accent/20',
    iconColor: 'text-accent'
  },
  { 
    id: 'paidOrdersCount',
    label: 'Pedidos Pagos', 
    getValue: (stats) => String(stats?.paidOrdersCount || 0),
    getChange: (stats) => stats?.paidOrdersChange || 0,
    icon: CheckCircle,
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success'
  },
  { 
    id: 'ordersValueTotal',
    label: 'Valor Total Pedidos', 
    getValue: (stats, formatPrice) => formatPrice(stats?.ordersValueTotal || 0),
    getChange: (stats) => stats?.ordersValueChange || 0,
    icon: DollarSign,
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary'
  },
  { 
    id: 'abandonmentRate',
    label: 'Taxa de Abandono', 
    getValue: (stats) => `${(stats?.abandonmentRate || 0).toFixed(1)}%`,
    getChange: (stats) => stats?.abandonmentRateChange || 0,
    icon: AlertCircle,
    gradient: 'from-destructive/20 to-destructive/5',
    iconBg: 'bg-destructive/20',
    iconColor: 'text-destructive',
    invertColors: true
  },
  { 
    id: 'customersTotal',
    label: 'Clientes', 
    getValue: (stats) => String(stats?.customersTotal || 0),
    getChange: (stats) => stats?.customersNew || 0,
    icon: Users,
    gradient: 'from-telegram/20 to-telegram/5',
    iconBg: 'bg-telegram/20',
    iconColor: 'text-telegram'
  },
  { 
    id: 'recurringCustomers',
    label: 'Clientes Recorrentes', 
    getValue: (stats) => String(stats?.recurringCustomers || 0),
    getChange: (stats) => stats?.recurringCustomersChange || 0,
    icon: UserCheck,
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success'
  },
];

export const OverviewPage = ({ client }: OverviewPageProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [activePreset, setActivePreset] = useState<number | null>(1);
  
  const { data: stats, isLoading } = useDashboardStats(client.id, dateRange);
  const { metrics, visibleMetrics, toggleMetric, reorderMetrics, resetToDefaults } = useDashboardPreferences(client.id);

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

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(0)}%`;
  };

  const displayedCards = useMemo(() => {
    return visibleMetrics
      .map(config => {
        const definition = METRIC_DEFINITIONS.find(d => d.id === config.id);
        if (!definition) return null;
        return {
          ...definition,
          value: isLoading ? null : definition.getValue(stats, formatPrice),
          change: definition.getChange(stats),
        };
      })
      .filter(Boolean);
  }, [visibleMetrics, stats, isLoading]);

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
        
        {/* Date filters + Customize */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
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

          <CustomizeDashboardDialog
            metrics={metrics}
            onToggle={toggleMetric}
            onReorder={reorderMetrics}
            onReset={resetToDefaults}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div 
        className={cn(
          "grid gap-4",
          displayedCards.length <= 2 ? "grid-cols-1 sm:grid-cols-2" :
          displayedCards.length === 3 ? "grid-cols-1 sm:grid-cols-3" :
          "grid-cols-2 lg:grid-cols-4"
        )}
        data-tour="stats-cards"
      >
        {displayedCards.map((stat) => {
          if (!stat) return null;
          const isPositive = stat.invertColors ? stat.change <= 0 : stat.change >= 0;
          const IconComponent = stat.icon;
          return (
            <Card 
              key={stat.id} 
              className={cn(
                "relative overflow-hidden border-0 bg-gradient-to-br",
                stat.gradient,
                "hover:scale-[1.02] transition-transform duration-200"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2.5 rounded-xl", stat.iconBg)}>
                    <IconComponent className={cn("w-5 h-5", stat.iconColor)} />
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    isPositive 
                      ? "bg-success/20 text-success" 
                      : "bg-destructive/20 text-destructive"
                  )}>
                    {formatChange(stat.change)}
                  </span>
                </div>
                {stat.value === null ? (
                  <Skeleton className="h-9 w-24 mb-1" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                    {stat.value}
                  </div>
                )}
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </p>
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
