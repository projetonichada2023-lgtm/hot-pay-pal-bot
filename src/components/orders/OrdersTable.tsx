import { Order, OrderStatus } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Package, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrdersTableProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
  isUpdating?: boolean;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  paid: { label: 'Pago', variant: 'default' },
  delivered: { label: 'Entregue', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
  refunded: { label: 'Reembolsado', variant: 'outline' },
};

export const OrdersTable = ({ orders, onUpdateStatus, onViewDetails, isUpdating }: OrdersTableProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getCustomerName = (order: Order) => {
    const customer = order.telegram_customers;
    if (!customer) return 'Cliente desconhecido';
    
    const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ');
    return name || customer.telegram_username || `ID: ${customer.telegram_id}`;
  };

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhum pedido encontrado.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const status = order.status as OrderStatus;
              const config = statusConfig[status] || statusConfig.pending;
              
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{getCustomerName(order)}</span>
                      {order.telegram_customers?.telegram_username && (
                        <span className="text-xs text-muted-foreground">
                          @{order.telegram_customers.telegram_username}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {order.products?.image_url ? (
                        <img
                          src={order.products.image_url}
                          alt={order.products.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="line-clamp-1">{order.products?.name || 'Produto removido'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(Number(order.amount))}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.created_at && formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isUpdating}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'paid')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Marcar como Pago
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'cancelled')}>
                              <XCircle className="h-4 w-4 mr-2 text-red-500" />
                              Cancelar
                            </DropdownMenuItem>
                          </>
                        )}
                        {status === 'paid' && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'delivered')}>
                            <Package className="h-4 w-4 mr-2 text-blue-500" />
                            Marcar como Entregue
                          </DropdownMenuItem>
                        )}
                        {(status === 'paid' || status === 'delivered') && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'refunded')}>
                            <RefreshCw className="h-4 w-4 mr-2 text-orange-500" />
                            Reembolsar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
