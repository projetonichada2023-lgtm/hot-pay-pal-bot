import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, CheckCircle2, AlertCircle, MousePointer, Eye, ShoppingCart, CreditCard, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TikTokEventsHistoryProps {
  clientId: string;
}

interface TikTokEvent {
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

const eventTypeConfig: Record<string, { label: string; icon: typeof MousePointer; color: string }> = {
  ClickButton: { label: 'Click', icon: MousePointer, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  ViewContent: { label: 'View', icon: Eye, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  InitiateCheckout: { label: 'Checkout', icon: ShoppingCart, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  CompletePayment: { label: 'Pagamento', icon: CreditCard, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
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

export const TikTokEventsHistory = ({ clientId }: TikTokEventsHistoryProps) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['tiktok-events-history', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiktok_events')
        .select('id, event_type, event_id, value, currency, utm_campaign, ttclid, created_at, api_status, api_response_code, api_error_message')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as TikTokEvent[];
    },
    enabled: !!clientId,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Eventos
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
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Eventos
          </CardTitle>
          <CardDescription>
            Últimos 20 eventos enviados para o TikTok
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!events || events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento registrado ainda</p>
              <p className="text-sm">Os eventos aparecerão aqui quando usuários interagirem com seu bot</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event) => {
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
