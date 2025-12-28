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
import { TopProductsWidget } from '@/components/dashboard/TopProductsWidget';
import { OrderStatusWidget } from '@/components/dashboard/OrderStatusWidget';
import { RecentCustomersWidget } from '@/components/dashboard/RecentCustomersWidget';
import { SalesByHourWidget } from '@/components/dashboard/SalesByHourWidget';
import { CustomizeDashboardDialog } from '@/components/dashboard/CustomizeDashboardDialog';
import { BentoCard, BentoSize } from '@/components/dashboard/BentoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays } from 'date-fns';
import { LucideIcon } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

const widgetContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const widgetVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

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

const METRIC_DEFINITIONS: (MetricDefinition & { size: BentoSize; glowColor: string })[] = [
  { 
    id: 'ordersTotal',
    label: 'Total Pedidos', 
    getValue: (stats) => String(stats?.ordersTotal || 0),
    getChange: (stats) => stats?.ordersChange || 0,
    icon: ShoppingCart,
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    size: 'medium',
    glowColor: 'primary'
  },
  { 
    id: 'salesTotal',
    label: 'Receita Total', 
    getValue: (stats, formatPrice) => formatPrice(stats?.salesTotal || 0),
    getChange: (stats) => stats?.salesChange || 0,
    icon: DollarSign,
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
    size: 'medium',
    glowColor: 'success'
  },
  { 
    id: 'conversionRate',
    label: 'Taxa de Conversão', 
    getValue: (stats) => `${(stats?.conversionRate || 0).toFixed(1)}%`,
    getChange: (stats) => stats?.conversionChange || 0,
    icon: TrendingUp,
    gradient: 'from-warning/20 to-warning/5',
    iconBg: 'bg-warning/20',
    iconColor: 'text-warning',
    size: 'small',
    glowColor: 'warning'
  },
  { 
    id: 'averageTicket',
    label: 'Ticket Médio', 
    getValue: (stats, formatPrice) => formatPrice(stats?.averageTicket || 0),
    getChange: (stats) => stats?.averageTicketChange || 0,
    icon: Receipt,
    gradient: 'from-accent/20 to-accent/5',
    iconBg: 'bg-accent/20',
    iconColor: 'text-accent',
    size: 'small',
    glowColor: 'accent'
  },
  { 
    id: 'paidOrdersCount',
    label: 'Pedidos Pagos', 
    getValue: (stats) => String(stats?.paidOrdersCount || 0),
    getChange: (stats) => stats?.paidOrdersChange || 0,
    icon: CheckCircle,
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
    size: 'small',
    glowColor: 'success'
  },
  { 
    id: 'ordersValueTotal',
    label: 'Valor Total Pedidos', 
    getValue: (stats, formatPrice) => formatPrice(stats?.ordersValueTotal || 0),
    getChange: (stats) => stats?.ordersValueChange || 0,
    icon: DollarSign,
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    size: 'small',
    glowColor: 'primary'
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
    invertColors: true,
    size: 'small',
    glowColor: 'destructive'
  },
  { 
    id: 'customersTotal',
    label: 'Clientes', 
    getValue: (stats) => String(stats?.customersTotal || 0),
    getChange: (stats) => stats?.customersNew || 0,
    icon: Users,
    gradient: 'from-telegram/20 to-telegram/5',
    iconBg: 'bg-telegram/20',
    iconColor: 'text-telegram',
    size: 'medium',
    glowColor: 'telegram'
  },
  { 
    id: 'recurringCustomers',
    label: 'Clientes Recorrentes', 
    getValue: (stats) => String(stats?.recurringCustomers || 0),
    getChange: (stats) => stats?.recurringCustomersChange || 0,
    icon: UserCheck,
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
    size: 'small',
    glowColor: 'success'
  },
];

export const OverviewPage = ({ client }: OverviewPageProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [activePreset, setActivePreset] = useState<number | null>(1);
  
  const { data: stats, isLoading } = useDashboardStats(client.id, dateRange);
  const { 
    metrics, visibleMetrics, toggleMetric, reorderMetrics, 
    widgets, visibleWidgets, toggleWidget, reorderWidgets,
    resetToDefaults 
  } = useDashboardPreferences(client.id);

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
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="dashboard-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <motion.h1 
                className="text-3xl font-bold tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              >
                Dashboard
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Bem-vindo de volta, <span className="text-foreground font-medium">{client.business_name}</span>
              </motion.p>
            </div>
            <motion.div 
              className="hidden sm:flex items-center gap-3 mr-14"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                <div className={cn(
                  "status-dot",
                  client.webhook_configured ? 'bg-success' : 'bg-warning'
                )} />
                <span className="text-sm font-medium">
                  Bot {client.webhook_configured ? 'Ativo' : 'Pendente'}
                </span>
              </div>
            </motion.div>
          </div>
          
          {/* Date filters + Customize */}
          <motion.div 
            className="flex items-center justify-between gap-3 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/50">
                {presetRanges.map((preset, index) => (
                  <motion.div
                    key={preset.days}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Button
                      variant={activePreset === preset.days ? 'default' : 'ghost'}
                      size="sm"
                      className={cn(
                        "text-xs sm:text-sm h-8 px-3 rounded-lg transition-all",
                        activePreset === preset.days 
                          ? 'shadow-sm' 
                          : 'hover:bg-background/50'
                      )}
                      onClick={() => handlePresetClick(preset.days)}
                    >
                      {preset.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-xs sm:text-sm h-8 px-3 rounded-lg border-border/50 hover:border-border hover:bg-muted/50"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="hidden xs:inline font-medium">
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
              widgets={widgets}
              onToggleMetric={toggleMetric}
              onReorderMetrics={reorderMetrics}
              onToggleWidget={toggleWidget}
              onReorderWidgets={reorderWidgets}
              onReset={resetToDefaults}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <div className="bento-grid" data-tour="stats-cards">
        {displayedCards.map((stat, index) => {
          if (!stat) return null;
          const isPositive = stat.invertColors ? stat.change <= 0 : stat.change >= 0;
          const IconComponent = stat.icon;
          
          return (
            <BentoCard
              key={stat.id}
              size={stat.size}
              gradient={stat.gradient}
              glowColor={stat.glowColor}
              delay={index}
            >
              <div className="relative p-5 h-full flex flex-col justify-between">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <motion.div 
                    className={cn(
                      "p-2.5 rounded-xl backdrop-blur-sm icon-pulse",
                      stat.iconBg
                    )}
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.08, type: 'spring' }}
                  >
                    <IconComponent className={cn("w-5 h-5", stat.iconColor)} />
                  </motion.div>
                  <motion.div 
                    className={cn(
                      "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm",
                      isPositive 
                        ? "bg-success/15 text-success" 
                        : "bg-destructive/15 text-destructive"
                    )}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.08 }}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3 rotate-180" />
                    )}
                    {formatChange(stat.change)}
                  </motion.div>
                </div>

                {/* Value and label */}
                <div className="mt-auto pt-4">
                  {stat.value === null ? (
                    <div className="shimmer">
                      <Skeleton className="h-10 w-28 mb-1" />
                    </div>
                  ) : (
                    <motion.div 
                      className="text-3xl md:text-4xl font-bold tracking-tight text-foreground counter-value"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + index * 0.08 }}
                    >
                      {stat.value}
                    </motion.div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </BentoCard>
          );
        })}
      </div>

      {/* Widgets Grid - dynamically rendered based on preferences */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={widgetContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleWidgets.map((widget) => {
          const getWidgetComponent = () => {
            switch (widget.id) {
              case 'salesChart':
                return (
                  <motion.div 
                    key={widget.id} 
                    className="lg:col-span-2" 
                    data-tour="sales-chart"
                    variants={widgetVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <SalesChart clientId={client.id} dateRange={dateRange} />
                  </motion.div>
                );
              case 'recentOrders':
                return (
                  <motion.div key={widget.id} variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <RecentOrdersCard clientId={client.id} />
                  </motion.div>
                );
              case 'funnelInsights':
                return (
                  <motion.div key={widget.id} variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <FunnelInsightsCard clientId={client.id} />
                  </motion.div>
                );
              case 'topProducts':
                return (
                  <motion.div key={widget.id} variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <TopProductsWidget clientId={client.id} />
                  </motion.div>
                );
              case 'orderStatus':
                return (
                  <motion.div key={widget.id} variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <OrderStatusWidget clientId={client.id} />
                  </motion.div>
                );
              case 'recentCustomers':
                return (
                  <motion.div key={widget.id} variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <RecentCustomersWidget clientId={client.id} />
                  </motion.div>
                );
              case 'salesByHour':
                return (
                  <motion.div key={widget.id} variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <SalesByHourWidget clientId={client.id} />
                  </motion.div>
                );
              default:
                return null;
            }
          };
          return getWidgetComponent();
        })}
      </motion.div>

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
