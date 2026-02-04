import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Users,
  DollarSign,
  Plus,
  Minus,
  Unlock,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useAdminBillingStats,
  useDelinquentClients,
  useRecentBalancePayments,
  useDailyFeesChart,
  useAdminBalanceAction,
  ClientWithBalance,
} from '@/hooks/useAdminBilling';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AdminBillingPage = () => {
  const { data: stats, isLoading: statsLoading } = useAdminBillingStats();
  const { data: delinquents, isLoading: delinquentsLoading } = useDelinquentClients();
  const { data: recentPayments, isLoading: paymentsLoading } = useRecentBalancePayments();
  const { data: chartData } = useDailyFeesChart(30);
  const adminAction = useAdminBalanceAction();

  const [actionDialog, setActionDialog] = useState<{
    type: 'credit' | 'debit' | 'unblock';
    client: ClientWithBalance;
  } | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionDescription, setActionDescription] = useState('');

  const isLoading = statsLoading || delinquentsLoading;

  const handleAction = async () => {
    if (!actionDialog) return;

    const { type, client } = actionDialog;

    if (type === 'unblock') {
      await adminAction.mutateAsync({
        action: 'unblock',
        clientId: client.id,
      });
    } else {
      const amount = parseFloat(actionAmount);
      if (isNaN(amount) || amount <= 0) return;

      await adminAction.mutateAsync({
        action: type,
        clientId: client.id,
        amount,
        description: actionDescription || undefined,
      });
    }

    setActionDialog(null);
    setActionAmount('');
    setActionDescription('');
  };

  // Calculate days since debt started
  const getDaysSinceDebt = (debtStartedAt: string | null) => {
    if (!debtStartedAt) return 0;
    const start = new Date(debtStartedAt);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Taxas da plataforma</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">💳 Financeiro</h1>
        <p className="text-muted-foreground">Taxas da plataforma e gestão de inadimplência</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(stats?.todayFees || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats?.todayCount || 0} vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(stats?.monthFees || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats?.monthCount || 0} vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívida Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {(stats?.totalDebt || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.delinquentClients || 0} clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.blockedClients || 0}</div>
            <p className="text-xs text-muted-foreground">clientes suspensos</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📈 Taxas por Dia (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => format(new Date(val), 'dd/MM', { locale: ptBR })}
                    className="text-xs"
                  />
                  <YAxis tickFormatter={(val) => `R$ ${val}`} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                    labelFormatter={(label) =>
                      format(new Date(label), "dd 'de' MMMM", { locale: ptBR })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delinquent Clients */}
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Clientes com Pendências</CardTitle>
          <CardDescription>Clientes com dívidas de taxas não pagas</CardDescription>
        </CardHeader>
        <CardContent>
          {delinquents && delinquents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Dívida</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delinquents.map((client) => {
                  const balance = client.client_balances;
                  const daysSinceDebt = getDaysSinceDebt(balance?.debt_started_at || null);
                  const isBlocked = balance?.is_blocked || false;

                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.business_name}</p>
                          <p className="text-xs text-muted-foreground">{client.business_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-green-600">
                        R$ {(Number(balance?.balance) || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-red-600 font-bold">
                        R$ {(Number(balance?.debt_amount) || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={daysSinceDebt >= client.max_debt_days ? 'destructive' : 'outline'}
                        >
                          {daysSinceDebt} dias
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isBlocked ? (
                          <Badge variant="destructive">Bloqueado</Badge>
                        ) : (
                          <Badge variant="outline">Ativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActionDialog({ type: 'credit', client })
                            }
                            title="Adicionar crédito"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActionDialog({ type: 'debit', client })
                            }
                            title="Debitar"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          {isBlocked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setActionDialog({ type: 'unblock', client })
                              }
                              title="Desbloquear"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum cliente com pendências! 🎉</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Últimos Pagamentos de Taxa</CardTitle>
          <CardDescription>Recargas de saldo recentes</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <Skeleton className="h-32" />
          ) : recentPayments && recentPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.clients?.business_name || 'Cliente'}
                    </TableCell>
                    <TableCell className="text-green-600 font-bold">
                      R$ {Number(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.payment_method === 'pix' ? 'PIX' : 
                         payment.payment_method === 'stripe' ? 'Cartão' : 
                         payment.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum pagamento recente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'credit' && '➕ Adicionar Crédito'}
              {actionDialog?.type === 'debit' && '➖ Debitar Valor'}
              {actionDialog?.type === 'unblock' && '🔓 Desbloquear Cliente'}
            </DialogTitle>
            <DialogDescription>
              Cliente: <strong>{actionDialog?.client.business_name}</strong>
            </DialogDescription>
          </DialogHeader>

          {actionDialog?.type !== 'unblock' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  placeholder="Motivo do ajuste..."
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              O cliente será desbloqueado e terá mais tempo para pagar a dívida.
              A contagem de dias será reiniciada.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAction} disabled={adminAction.isPending}>
              {adminAction.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
