import { useState, useEffect, useCallback } from 'react';

export interface MetricConfig {
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

const STORAGE_KEY = 'dashboard-metrics-preferences';

export const useDashboardPreferences = (clientId: string) => {
  const storageKey = `${STORAGE_KEY}-${clientId}`;
  
  const [metrics, setMetrics] = useState<MetricConfig[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults in case new metrics were added
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

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(metrics));
    } catch (e) {
      console.error('Error saving dashboard preferences:', e);
    }
  }, [metrics, storageKey]);

  const toggleMetric = useCallback((id: string) => {
    setMetrics(prev => 
      prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m)
    );
  }, []);

  const reorderMetrics = useCallback((newOrder: MetricConfig[]) => {
    setMetrics(newOrder.map((m, index) => ({ ...m, order: index })));
  }, []);

  const resetToDefaults = useCallback(() => {
    setMetrics(DEFAULT_METRICS);
  }, []);

  const visibleMetrics = metrics.filter(m => m.visible).sort((a, b) => a.order - b.order);

  return {
    metrics,
    visibleMetrics,
    toggleMetric,
    reorderMetrics,
    resetToDefaults,
  };
};
