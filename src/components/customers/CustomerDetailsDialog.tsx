import { Customer, useCustomerOrders } from '@/hooks/useCustomers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingCart, 
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsDialog = ({ customer, open, onOpenChange }: CustomerDetailsDialogProps) => {
  const { data: orders, isLoading: ordersLoading } = useCustomerOrders(customer?.id || null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getCustomerName = (customer: Customer) => {
    const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ');
    return name || 'Sem nome';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { label: 'Pendente', variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      paid: { label: 'Pago', variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      delivered: { label: 'Entregue', variant: 'default', icon: <Package className="w-3 h-3" /> },
      cancelled: { label: 'Cancelado', variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
      refunded: { label: 'Reembolsado', variant: 'outline', icon: <XCircle className="w-3 h-3" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Detalhes do Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{getCustomerName(customer)}</span>
              </div>
              
              {customer.telegram_username && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 text-telegram text-center">@</span>
                  <a 
                    href={`https://t.me/${customer.telegram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-telegram hover:underline"
                  >
                    {customer.telegram_username}
                  </a>
                </div>
              )}

              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Cliente desde {formatDateTime(customer.created_at)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 text-center">
                <ShoppingCart className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">{customer.total_orders}</div>
                <div className="text-xs text-muted-foreground">Pedidos</div>
              </div>
              <div className="glass-card p-4 text-center">
                <DollarSign className="w-6 h-6 mx-auto text-success mb-2" />
                <div className="text-2xl font-bold">{formatCurrency(customer.total_spent)}</div>
                <div className="text-xs text-muted-foreground">Total Gasto</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order History */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Histórico de Pedidos
            </h3>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : orders && orders.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className="glass-card p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {order.product_name || 'Produto não encontrado'}
                            </span>
                            {order.is_upsell && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <ArrowUpRight className="w-3 h-3" />
                                Upsell
                              </Badge>
                            )}
                            {order.is_downsell && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <ArrowDownRight className="w-3 h-3" />
                                Downsell
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(order.amount)}</div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      {(order.paid_at || order.delivered_at) && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {order.paid_at && (
                            <span>Pago: {formatDateTime(order.paid_at)}</span>
                          )}
                          {order.delivered_at && (
                            <span>Entregue: {formatDateTime(order.delivered_at)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
