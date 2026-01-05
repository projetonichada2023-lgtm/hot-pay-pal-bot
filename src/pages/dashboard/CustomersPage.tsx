import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { useCustomers, Customer, CustomerFilters as Filters } from '@/hooks/useCustomers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Download } from 'lucide-react';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomerDetailsDialog } from '@/components/customers/CustomerDetailsDialog';
import { CustomerStats } from '@/components/customers/CustomerStats';
import { exportCustomers } from '@/lib/export-csv';
import { toast } from 'sonner';

interface CustomersPageProps {
  client: Client;
}

export const CustomersPage = ({ client }: CustomersPageProps) => {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    hasOrders: 'all',
    sortBy: 'recent',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: customers = [], isLoading } = useCustomers(filters);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes do Telegram
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (customers.length === 0) {
              toast.error('Nenhum cliente para exportar');
              return;
            }
            exportCustomers(customers);
            toast.success('Exportação concluída!');
          }}
          disabled={customers.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <CustomerStats customers={customers} />

      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          <CustomerFilters filters={filters} onFiltersChange={setFilters} />
          <CustomersTable 
            customers={customers} 
            isLoading={isLoading} 
            onViewCustomer={handleViewCustomer}
          />
        </CardContent>
      </Card>

      <CustomerDetailsDialog 
        customer={selectedCustomer}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
};
