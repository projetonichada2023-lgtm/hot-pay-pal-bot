import { useAffiliate } from "@/hooks/useAffiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const AffiliateCommissions = () => {
  const { commissions, stats } = useAffiliate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-500">Pago</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">Pendente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Comissões</h2>
        <p className="text-muted-foreground">
          Acompanhe todas as suas comissões e pagamentos
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Pendente</p>
            <p className="text-2xl font-bold text-yellow-500">
              {formatCurrency(stats.pendingCommissions)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Pago</p>
            <p className="text-2xl font-bold text-emerald-500">
              {formatCurrency(stats.paidCommissions)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Geral</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(stats.totalEarnings)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma comissão registrada ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pago em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      {format(new Date(commission.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(commission.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                    <TableCell>
                      {commission.paid_at
                        ? format(new Date(commission.paid_at), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">ℹ️ Sobre os Pagamentos</h3>
          <p className="text-sm text-muted-foreground">
            Os pagamentos são processados semanalmente, toda sexta-feira. 
            O valor mínimo para saque é de R$ 50,00. 
            Certifique-se de que sua chave PIX está configurada corretamente nas configurações.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
