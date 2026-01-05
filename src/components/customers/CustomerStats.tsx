import { Customer } from '@/hooks/useCustomers';
import { Card, CardContent } from '@/components/ui/card';
import { Users, ShoppingCart, DollarSign, UserPlus } from 'lucide-react';

interface CustomerStatsProps {
  customers: Customer[];
}

export const CustomerStats = ({ customers }: CustomerStatsProps) => {
  const totalCustomers = customers.length;
  const customersWithOrders = customers.filter(c => c.total_orders > 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.total_orders, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const stats = [
    {
      label: 'Total de Clientes',
      value: totalCustomers,
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Clientes Ativos',
      value: customersWithOrders,
      icon: UserPlus,
      color: 'text-success',
    },
    {
      label: 'Total de Pedidos',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'text-telegram',
    },
    {
      label: 'Receita Total',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-warning',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
