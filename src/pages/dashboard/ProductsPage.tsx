import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface ProductsPageProps {
  client: Client;
}

export const ProductsPage = ({ client }: ProductsPageProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Produtos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos digitais
          </p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A gestão de produtos será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
