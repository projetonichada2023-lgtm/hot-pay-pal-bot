import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface CustomersPageProps {
  client: Client;
}

export const CustomersPage = ({ client }: CustomersPageProps) => {
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
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A gestão de clientes será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
