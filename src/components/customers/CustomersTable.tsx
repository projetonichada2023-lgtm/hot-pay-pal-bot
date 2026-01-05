import { Customer } from '@/hooks/useCustomers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EmptyCustomers } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  onViewCustomer: (customer: Customer) => void;
}

export const CustomersTable = ({ customers, isLoading, onViewCustomer }: CustomersTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getCustomerName = (customer: Customer) => {
    const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ');
    return name || 'Sem nome';
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Telegram</TableHead>
              <TableHead className="text-center">Pedidos</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="hidden md:table-cell">Último Pedido</TableHead>
              <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (customers.length === 0) {
    return <EmptyCustomers />;
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden sm:table-cell">Telegram</TableHead>
            <TableHead className="text-center">Pedidos</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="hidden md:table-cell">Último Pedido</TableHead>
            <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{getCustomerName(customer)}</span>
                  {customer.email && (
                    <span className="text-xs text-muted-foreground">{customer.email}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {customer.telegram_username ? (
                  <a 
                    href={`https://t.me/${customer.telegram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-telegram hover:underline"
                  >
                    @{customer.telegram_username}
                  </a>
                ) : (
                  <span className="text-muted-foreground">ID: {customer.telegram_id}</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={customer.total_orders > 0 ? 'default' : 'secondary'}>
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {customer.total_orders}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium text-xs md:text-sm">
                {formatCurrency(customer.total_spent)}
              </TableCell>
              <TableCell className="hidden md:table-cell">{formatDate(customer.last_order_date)}</TableCell>
              <TableCell className="hidden lg:table-cell">{formatDate(customer.created_at)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewCustomer(customer)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
