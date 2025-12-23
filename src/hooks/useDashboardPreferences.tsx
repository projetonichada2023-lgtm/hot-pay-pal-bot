import { useState, useEffect, useCallback } from 'react';

export interface MetricConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

const DEFAULT_METRICS: MetricConfig[] = [
  { id: 'ordersTotal', label: 'Total Pedidos', visible: true, order: 0 },
  { id: 'salesTotal', label: 'Receita Total', visible: true, order: 1 },
  { id: 'conversionRate', label: 'Taxa de Conversão', visible: true, order: 2 },
  { id: 'averageTicket', label: 'Ticket Médio', visible: true, order: 3 },
  { id: 'paidOrdersCount', label: 'Pedidos Pagos', visible: false, order: 4 },
  { id: 'ordersValueTotal', label: 'Valor Total Pedidos', visible: false, order: 5 },
  { id: 'abandonmentRate', label: 'Taxa de Abandono', visible: false, order: 6 },
  { id: 'customersTotal', label: 'Clientes', visible: false, order: 7 },
  { id: 'recurringCustomers', label: 'Clientes Recorrentes', visible: false, order: 8 },
];

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'salesChart', label: 'Gráfico de Vendas', visible: true, order: 0 },
  { id: 'recentOrders', label: 'Pedidos Recentes', visible: true, order: 1 },
  { id: 'funnelInsights', label: 'Insights do Funil', visible: true, order: 2 },
  { id: 'topProducts', label: 'Top Produtos', visible: false, order: 3 },
  { id: 'orderStatus', label: 'Status dos Pedidos', visible: false, order: 4 },
  { id: 'recentCustomers', label: 'Clientes Recentes', visible: false, order: 5 },
  { id: 'salesByHour', label: 'Vendas por Hora', visible: false, order: 6 },
];

const METRICS_STORAGE_KEY = 'dashboard-metrics-preferences';
const WIDGETS_STORAGE_KEY = 'dashboard-widgets-preferences';

export const useDashboardPreferences = (clientId: string) => {
  const metricsStorageKey = `${METRICS_STORAGE_KEY}-${clientId}`;
  const widgetsStorageKey = `${WIDGETS_STORAGE_KEY}-${clientId}`;
  
  const [metrics, setMetrics] = useState<MetricConfig[]>(() => {
    try {
      const saved = localStorage.getItem(metricsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const mergedMetrics = DEFAULT_METRICS.map(defaultMetric => {
          const savedMetric = parsed.find((m: MetricConfig) => m.id === defaultMetric.id);
          return savedMetric || defaultMetric;
        });
        return mergedMetrics.sort((a, b) => a.order - b.order);
      }
    } catch (e) {
      console.error('Error loading dashboard preferences:', e);
    }
    return DEFAULT_METRICS;
  });

  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(widgetsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
          const savedWidget = parsed.find((w: WidgetConfig) => w.id === defaultWidget.id);
          return savedWidget || defaultWidget;
        });
        return mergedWidgets.sort((a, b) => a.order - b.order);
      }
    } catch (e) {
      console.error('Error loading widget preferences:', e);
    }
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(metricsStorageKey, JSON.stringify(metrics));
    } catch (e) {
      console.error('Error saving dashboard preferences:', e);
    }
  }, [metrics, metricsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(widgetsStorageKey, JSON.stringify(widgets));
    } catch (e) {
      console.error('Error saving widget preferences:', e);
    }
  }, [widgets, widgetsStorageKey]);

  const toggleMetric = useCallback((id: string) => {
    setMetrics(prev => 
      prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m)
    );
  }, []);

  const reorderMetrics = useCallback((newOrder: MetricConfig[]) => {
    setMetrics(newOrder.map((m, index) => ({ ...m, order: index })));
  }, []);

  const toggleWidget = useCallback((id: string) => {
    setWidgets(prev => 
      prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w)
    );
  }, []);

  const reorderWidgets = useCallback((newOrder: WidgetConfig[]) => {
    setWidgets(newOrder.map((w, index) => ({ ...w, order: index })));
  }, []);

  const resetToDefaults = useCallback(() => {
    setMetrics(DEFAULT_METRICS);
    setWidgets(DEFAULT_WIDGETS);
  }, []);

  const visibleMetrics = metrics.filter(m => m.visible).sort((a, b) => a.order - b.order);
  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);

  return {
    metrics,
    visibleMetrics,
    toggleMetric,
    reorderMetrics,
    widgets,
    visibleWidgets,
    toggleWidget,
    reorderWidgets,
    resetToDefaults,
  };
};
