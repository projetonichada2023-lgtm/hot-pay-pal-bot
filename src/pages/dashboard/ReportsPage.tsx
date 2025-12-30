import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, BarChart3, Package, GitBranch, Download, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from '@/hooks/useDashboardStats';
import { useReportsData, exportToCSV } from '@/hooks/useReportsData';
import { SalesReportChart } from '@/components/reports/SalesReportChart';
import { TopProductsChart } from '@/components/reports/TopProductsChart';
import { FunnelPerformanceChart } from '@/components/reports/FunnelPerformanceChart';
import { TikTokStatsCard } from '@/components/reports/TikTokStatsCard';
import { cn } from '@/lib/utils';

interface ReportsPageProps {
  client: Client;
}

const presetRanges = [
  { label: 'Hoje', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
];

export const ReportsPage = ({ client }: ReportsPageProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [activePreset, setActivePreset] = useState<number | null>(30);
  const [activeTab, setActiveTab] = useState('sales');

  const { salesData, topProducts, funnelData, isLoading } = useReportsData(client.id, dateRange);

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

  const handleExportAll = () => {
    // Export all data
    const allData = [
      ...salesData.map(d => ({
        Tipo: 'Vendas',
        Data: d.date,
        Valor: d.sales,
        Pedidos: d.orders,
      })),
      ...topProducts.map(d => ({
        Tipo: 'Produto',
        Nome: d.name,
        Vendas: d.sales,
        Receita: d.revenue,
        Conversao: d.conversionRate.toFixed(1),
      })),
      ...funnelData.map(d => ({
        Tipo: 'Funil',
        Etapa: d.stage,
        Quantidade: d.count,
        Valor: d.value,
        Taxa: d.rate.toFixed(1),
      })),
    ];
    exportToCSV(allData, 'relatorio-completo');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground text-sm">Análise detalhada de vendas e performance</p>
          </div>
          <Button onClick={handleExportAll} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Tudo
          </Button>
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
                locale={ptBR}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="sales" className="gap-2">
            <BarChart3 className="w-4 h-4 hidden sm:inline" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4 hidden sm:inline" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="funnel" className="gap-2">
            <GitBranch className="w-4 h-4 hidden sm:inline" />
            Funil
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="gap-2">
            <TrendingUp className="w-4 h-4 hidden sm:inline" />
            TikTok
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <SalesReportChart data={salesData} isLoading={isLoading} />
          
          {/* Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total de Vendas</p>
                <p className="text-xl font-bold text-success">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(salesData.reduce((sum, d) => sum + d.sales, 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total de Pedidos</p>
                <p className="text-xl font-bold">
                  {salesData.reduce((sum, d) => sum + d.orders, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Ticket Médio</p>
                <p className="text-xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(
                      salesData.reduce((sum, d) => sum + d.orders, 0) > 0
                        ? salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.reduce((sum, d) => sum + d.orders, 0)
                        : 0
                    )}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Média Diária</p>
                <p className="text-xl font-bold text-telegram">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(
                      salesData.length > 0
                        ? salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.length
                        : 0
                    )}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <TopProductsChart data={topProducts} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="funnel">
          <FunnelPerformanceChart data={funnelData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="tiktok">
          <TikTokStatsCard clientId={client.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
