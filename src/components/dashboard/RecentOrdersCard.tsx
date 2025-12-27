import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

interface RecentOrdersCardProps {
  clientId: string;
}

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, variant: 'secondary' as const },
  paid: { label: 'Pago', icon: CheckCircle, variant: 'default' as const },
  delivered: { label: 'Entregue', icon: Truck, variant: 'default' as const },
  cancelled: { label: 'Cancelado', icon: XCircle, variant: 'destructive' as const },
  refunded: { label: 'Reembolsado', icon: XCircle, variant: 'outline' as const },
};

export const RecentOrdersCard = ({ clientId }: RecentOrdersCardProps) => {
  const { data, isLoading } = useOrders(clientId, null, 1, 5);
  const navigate = useNavigate();

  const recentOrders = data?.orders || [];

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="widget-card">
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-base font-semibold">Pedidos Recentes</h3>
        </div>
        <div className="px-6 pb-6 space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="widget-card">
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-base font-semibold">Pedidos Recentes</h3>
        </div>
        <button 
          onClick={() => navigate('/dashboard/orders')}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Ver todos
        </button>
      </div>
      <div className="px-6 pb-6">
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order, index) => {
              const status = order.status || 'pending';
              const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {order.telegram_customers?.first_name || 'Cliente'} {order.telegram_customers?.last_name || ''}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.products?.name || 'Produto removido'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="font-bold text-sm">
                      {formatPrice(Number(order.amount))}
                    </span>
                    <Badge variant={config.variant} className="text-[10px] px-2 py-0.5">
                      {config.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
