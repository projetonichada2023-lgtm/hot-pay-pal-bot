import { useState, useMemo } from 'react';
import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Bot,
  Receipt,
  Users,
  UserCheck,
  AlertCircle,
  CheckCircle,
  LucideIcon,
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
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { cn } from '@/lib/utils';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

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
  getValue: (stats: ReturnType<typeof useDashboardStats>['data'], formatPrice: (v: number) => string) => string | null;
  getChange: (stats: ReturnType<typeof useDashboardStats>['data']) => number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  iconColor: string;
  invertColors?: boolean;
}

const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    id: 'ordersTotal',
    label: 'Total Pedidos',
    getValue: (stats) => String(stats?.ordersTotal || 0),
    getChange: (stats) => stats?.ordersChange || 0,
    icon: ShoppingCart,
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
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
  },
];

export const OverviewPage = ({ client }: OverviewPageProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const { data: stats, isLoading } = useDashboardStats(client.id, dateRange);
  const {
    metrics,
    visibleMetrics,
    toggleMetric,
    reorderMetrics,
    widgets,
    visibleWidgets,
    toggleWidget,
    reorderWidgets,
    resetToDefaults,
  } = useDashboardPreferences(client.id);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const displayedCards = useMemo(() => {
    return visibleMetrics
      .map((config) => {
        const definition = METRIC_DEFINITIONS.find((d) => d.id === config.id);
        if (!definition) return null;
        return {
          ...definition,
          value: isLoading ? null : definition.getValue(stats, formatPrice),
          change: definition.getChange(stats),
        };
      })
      .filter(Boolean) as Array<MetricDefinition & { value: string | null; change: number }>;
  }, [visibleMetrics, stats, isLoading]);

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'salesChart':
        return (
          <motion.div className="lg:col-span-2" data-tour="sales-chart" variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <SalesChart clientId={client.id} dateRange={dateRange} />
          </motion.div>
        );
      case 'recentOrders':
        return (
          <motion.div variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <RecentOrdersCard clientId={client.id} />
          </motion.div>
        );
      case 'funnelInsights':
        return (
          <motion.div variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <FunnelInsightsCard clientId={client.id} />
          </motion.div>
        );
      case 'topProducts':
        return (
          <motion.div variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <TopProductsWidget clientId={client.id} />
          </motion.div>
        );
      case 'orderStatus':
        return (
          <motion.div variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <OrderStatusWidget clientId={client.id} />
          </motion.div>
        );
      case 'recentCustomers':
        return (
          <motion.div variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <RecentCustomersWidget clientId={client.id} />
          </motion.div>
        );
      case 'salesByHour':
        return (
          <motion.div variants={widgetVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <SalesByHourWidget clientId={client.id} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <motion.div className="dashboard-header" variants={headerVariants} initial="hidden" animate="visible">
        <div className="relative z-10 flex flex-col gap-4 md:gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <motion.h1
                className="text-xl md:text-3xl font-bold tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              >
                Dashboard
              </motion.h1>
              <motion.p className="text-sm md:text-base text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                Bem-vindo, <span className="text-foreground font-medium">{client.business_name}</span>
              </motion.p>
            </div>
            <motion.div
              className="hidden sm:flex items-center gap-3 mr-14"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                <div className={cn('status-dot', client.webhook_configured ? 'bg-success' : 'bg-warning')} />
                <span className="text-sm font-medium">Bot {client.webhook_configured ? 'Ativo' : 'Pendente'}</span>
              </div>
            </motion.div>
          </div>

          {/* Date filters + Customize */}
          <motion.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />

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

      {/* Stats Grid */}
      <motion.div
        className={cn(
          'grid gap-2 sm:gap-4',
          displayedCards.length <= 2
            ? 'grid-cols-2'
            : displayedCards.length === 3
            ? 'grid-cols-3'
            : 'grid-cols-2 lg:grid-cols-4'
        )}
        data-tour="stats-cards"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayedCards.map((stat, index) => (
          <MetricCard
            key={stat.id}
            id={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            gradient={stat.gradient}
            iconBg={stat.iconBg}
            iconColor={stat.iconColor}
            invertColors={stat.invertColors}
            index={index}
          />
        ))}
      </motion.div>

      {/* Widgets Grid */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6" variants={widgetContainerVariants} initial="hidden" animate="visible">
        {visibleWidgets.map((widget) => (
          <div key={widget.id}>{renderWidget(widget.id)}</div>
        ))}
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
                <CardDescription>Para começar a vender, configure seu bot do Telegram</CardDescription>
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
