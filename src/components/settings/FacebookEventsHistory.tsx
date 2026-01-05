import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle2, AlertCircle, Eye, ShoppingCart, CreditCard, XCircle, Loader2, Filter, RefreshCw, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface FacebookEventsHistoryProps {
  clientId: string;
}

interface FacebookEvent {
  id: string;
  event_type: string;
  event_id: string;
  value: number | null;
  currency: string | null;
  utm_campaign: string | null;
  ttclid: string | null;
  created_at: string;
  api_status: string | null;
  api_response_code: number | null;
  api_error_message: string | null;
}

const eventTypeConfig: Record<string, { label: string; icon: typeof Eye; color: string }> = {
  PageView: { label: 'PageView', icon: FileText, color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
  ViewContent: { label: 'ViewContent', icon: Eye, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  InitiateCheckout: { label: 'Checkout', icon: ShoppingCart, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  Purchase: { label: 'Purchase', icon: CreditCard, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
};

const getStatusConfig = (status: string | null) => {
  switch (status) {
    case 'success':
      return { icon: CheckCircle2, color: 'text-green-500', label: 'Enviado' };
    case 'error':
      return { icon: XCircle, color: 'text-destructive', label: 'Erro' };
    case 'pending':
    default:
      return { icon: Loader2, color: 'text-muted-foreground', label: 'Pendente' };
  }
};

export const FacebookEventsHistory = ({ clientId }: FacebookEventsHistoryProps) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');

  const { data: events, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['facebook-events-history', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facebook_events')
        .select('id, event_type, event_id, value, currency, utm_campaign, ttclid, created_at, api_status, api_response_code, api_error_message')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as FacebookEvent[];
    },
    enabled: !!clientId,
    refetchInterval: 30000,
  });

  // Get unique campaigns for filter
  const campaigns = useMemo(() => {
    if (!events) return [];
    const uniqueCampaigns = [...new Set(events.map(e => e.utm_campaign).filter(Boolean))];
    return uniqueCampaigns as string[];
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      if (filterType !== 'all' && event.event_type !== filterType) return false;
      if (filterStatus !== 'all' && event.api_status !== filterStatus) return false;
      if (filterCampaign !== 'all') {
        if (filterCampaign === 'none' && event.utm_campaign) return false;
        if (filterCampaign !== 'none' && event.utm_campaign !== filterCampaign) return false;
      }
      return true;
    });
  }, [events, filterType, filterStatus, filterCampaign]);

  // Stats
  const stats = useMemo(() => {
    if (!events) return { total: 0, success: 0, error: 0, pending: 0 };
    return {
      total: events.length,
      success: events.filter(e => e.api_status === 'success').length,
      error: events.filter(e => e.api_status === 'error').length,
      pending: events.filter(e => e.api_status === 'pending').length,
    };
  }, [events]);

  const clearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setFilterCampaign('all');
  };

  const hasActiveFilters = filterType !== 'all' || filterStatus !== 'all' || filterCampaign !== 'all';

  if (isLoading) {
    return (
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Eventos Facebook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Histórico de Eventos Facebook
              </CardTitle>
              <CardDescription>
                {filteredEvents.length} de {stats.total} eventos
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="bg-muted/50">
              Total: {stats.total}
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Sucesso: {stats.success}
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
              Erro: {stats.error}
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              Pendente: {stats.pending}
            </Badge>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros:</span>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                <SelectItem value="PageView">PageView</SelectItem>
                <SelectItem value="ViewContent">ViewContent</SelectItem>
                <SelectItem value="InitiateCheckout">Checkout</SelectItem>
                <SelectItem value="Purchase">Purchase</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCampaign} onValueChange={setFilterCampaign}>
              <SelectTrigger className="w-[150px] h-8 text-sm">
                <SelectValue placeholder="Campanha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas campanhas</SelectItem>
                <SelectItem value="none">Sem campanha</SelectItem>
                {campaigns.map(campaign => (
                  <SelectItem key={campaign} value={campaign}>
                    {campaign}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-sm">
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              {hasActiveFilters ? (
                <>
                  <p>Nenhum evento encontrado com os filtros aplicados</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Limpar filtros
                  </Button>
                </>
              ) : (
                <>
                  <p>Nenhum evento registrado ainda</p>
                  <p className="text-sm">Os eventos aparecerão aqui quando usuários interagirem com seu bot</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredEvents.map((event) => {
                const config = eventTypeConfig[event.event_type] || {
                  label: event.event_type,
                  icon: CheckCircle2,
                  color: 'bg-muted text-muted-foreground',
                };
                const Icon = config.icon;
                const statusConfig = getStatusConfig(event.api_status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${config.color} border`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={config.color}>
                          {config.label}
                        </Badge>
                        {event.utm_campaign && (
                          <Badge variant="outline" className="text-xs">
                            {event.utm_campaign}
                          </Badge>
                        )}
                        {event.value && (
                          <span className="text-sm font-medium text-green-600">
                            R$ {event.value.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        ID: {event.event_id.slice(0, 8)}...
                        {event.api_response_code && ` • HTTP ${event.api_response_code}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`${statusConfig.color}`}>
                            <StatusIcon className={`w-5 h-5 ${event.api_status === 'pending' ? 'animate-spin' : ''}`} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="font-medium">{statusConfig.label}</p>
                          {event.api_error_message && (
                            <p className="text-xs text-muted-foreground mt-1">{event.api_error_message}</p>
                          )}
                          {event.api_response_code && (
                            <p className="text-xs text-muted-foreground">HTTP {event.api_response_code}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                      <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        <p>{format(new Date(event.created_at), 'dd/MM', { locale: ptBR })}</p>
                        <p>{format(new Date(event.created_at), 'HH:mm:ss', { locale: ptBR })}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
