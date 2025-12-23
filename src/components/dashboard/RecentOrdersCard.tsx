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
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5" />
          Pedidos Recentes
        </CardTitle>
        <button 
          onClick={() => navigate('/orders')}
          className="text-sm text-primary hover:underline"
        >
          Ver todos
        </button>
      </CardHeader>
      <CardContent>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Nenhum pedido ainda
          </p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => {
              const status = order.status || 'pending';
              const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-semibold text-sm">
                      {formatPrice(Number(order.amount))}
                    </span>
                    <Badge variant={config.variant} className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
