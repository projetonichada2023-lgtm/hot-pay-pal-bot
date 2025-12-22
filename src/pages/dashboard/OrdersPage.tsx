import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface OrdersPageProps {
  client: Client;
}

export const OrdersPage = ({ client }: OrdersPageProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Pedidos
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seus pedidos
          </p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A gestão de pedidos será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
