import { Order } from '@/hooks/useOrders';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Package, CreditCard, Calendar, MessageSquare } from 'lucide-react';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export const OrderDetailsDialog = ({ open, onOpenChange, order }: OrderDetailsDialogProps) => {
  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const customer = order.telegram_customers;
  const product = order.products;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes do Pedido
            <Badge variant="outline" className="font-mono text-xs">
              {order.id.slice(0, 8)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge>{statusLabels[order.status || 'pending']}</Badge>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              Cliente
            </div>
            <div className="pl-6 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Nome:</span>{' '}
                {[customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || '-'}
              </p>
              {customer?.telegram_username && (
                <p>
                  <span className="text-muted-foreground">Telegram:</span>{' '}
                  @{customer.telegram_username}
                </p>
              )}
              <p>
                <span className="text-muted-foreground">ID Telegram:</span>{' '}
                {customer?.telegram_id}
              </p>
              {customer?.email && (
                <p>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  {customer.email}
                </p>
              )}
              {customer?.phone && (
                <p>
                  <span className="text-muted-foreground">Telefone:</span>{' '}
                  {customer.phone}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Product Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              Produto
            </div>
            <div className="pl-6 flex items-center gap-3">
              {product?.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium">{product?.name || 'Produto removido'}</p>
                <p className="text-sm text-muted-foreground">
                  {product?.description?.slice(0, 50)}
                  {(product?.description?.length || 0) > 50 ? '...' : ''}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Pagamento
            </div>
            <div className="pl-6 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Valor:</span>{' '}
                <span className="font-medium text-lg">{formatPrice(Number(order.amount))}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Método:</span>{' '}
                {order.payment_method?.toUpperCase() || 'PIX'}
              </p>
              {order.payment_id && (
                <p>
                  <span className="text-muted-foreground">ID Pagamento:</span>{' '}
                  <span className="font-mono text-xs">{order.payment_id}</span>
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Datas
            </div>
            <div className="pl-6 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Criado em:</span>{' '}
                {formatDate(order.created_at)}
              </p>
              {order.paid_at && (
                <p>
                  <span className="text-muted-foreground">Pago em:</span>{' '}
                  {formatDate(order.paid_at)}
                </p>
              )}
              {order.delivered_at && (
                <p>
                  <span className="text-muted-foreground">Entregue em:</span>{' '}
                  {formatDate(order.delivered_at)}
                </p>
              )}
            </div>
          </div>

          {/* PIX Code */}
          {order.pix_code && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Código PIX
                </div>
                <div className="pl-6">
                  <code className="text-xs bg-muted p-2 rounded block break-all">
                    {order.pix_code}
                  </code>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
