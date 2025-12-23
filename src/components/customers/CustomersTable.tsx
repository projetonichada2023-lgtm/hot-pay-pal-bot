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
import { Eye, MessageCircle, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg">Nenhum cliente encontrado</h3>
        <p className="text-muted-foreground">
          Clientes aparecerão aqui quando interagirem com seu bot
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Cliente</TableHead>
            <TableHead>Telegram</TableHead>
            <TableHead className="text-center">Pedidos</TableHead>
            <TableHead className="text-right">Total Gasto</TableHead>
            <TableHead>Último Pedido</TableHead>
            <TableHead>Cadastro</TableHead>
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
              <TableCell>
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
              <TableCell className="text-right font-medium">
                {formatCurrency(customer.total_spent)}
              </TableCell>
              <TableCell>{formatDate(customer.last_order_date)}</TableCell>
              <TableCell>{formatDate(customer.created_at)}</TableCell>
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
