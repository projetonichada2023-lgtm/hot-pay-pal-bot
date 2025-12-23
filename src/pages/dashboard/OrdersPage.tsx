import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { useOrders, useUpdateOrderStatus, useOrderStats, Order, OrderStatus } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, Clock, CheckCircle, Package, XCircle, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { OrderDetailsDialog } from '@/components/orders/OrderDetailsDialog';
import { toast } from 'sonner';

interface OrdersPageProps {
  client: Client;
}

const statusOptions = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'paid', label: 'Pagos' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'cancelled', label: 'Cancelados' },
  { value: 'refunded', label: 'Reembolsados' },
];

const PAGE_SIZE = 10;

export const OrdersPage = ({ client }: OrdersPageProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useOrders(
    client.id, 
    statusFilter === 'all' ? null : statusFilter as OrderStatus,
    currentPage,
    PAGE_SIZE
  );
  const { data: stats } = useOrderStats(client.id);
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.orders || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  // Reset page when filter changes
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const extra: any = {};
      if (status === 'paid') extra.paid_at = new Date().toISOString();
      if (status === 'delivered') extra.delivered_at = new Date().toISOString();

      await updateStatus.mutateAsync({ orderId, clientId: client.id, status, extra });
      toast.success(`Status atualizado para ${statusOptions.find(s => s.value === status)?.label}`);
    } catch (error) {
      toast.error('Erro ao atualizar status');
      console.error(error);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Pedidos
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os pedidos dos seus clientes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-xs sm:text-sm text-muted-foreground">Pendentes</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats?.pending || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs sm:text-sm text-muted-foreground">Pagos</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats?.paid || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-xs sm:text-sm text-muted-foreground">Entregues</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats?.delivered || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs sm:text-sm text-muted-foreground">Cancelados</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats?.cancelled || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-xs sm:text-sm text-muted-foreground">Receita</span>
            </div>
            <p className="text-lg sm:text-xl font-bold mt-1">{formatPrice(stats?.totalRevenue || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="glass-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base sm:text-lg">Lista de Pedidos</CardTitle>
            {totalCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({totalCount} {totalCount === 1 ? 'pedido' : 'pedidos'})
              </span>
            )}
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <OrdersTable
                orders={orders}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={handleViewDetails}
                isUpdating={updateStatus.isPending}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Anterior</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline mr-1">Próxima</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <OrderDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        order={selectedOrder}
      />
    </div>
  );
};
