 import { useState, useEffect } from 'react';
 import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  TrendingDown, 
  Receipt, 
  Clock, 
  Plus, 
  History,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
 import { toast } from 'sonner';
import { Client } from '@/hooks/useClient';
import { 
  useClientBalance, 
  useBalanceTransactions, 
  useTodayFees, 
  useMonthlyFeeStats 
} from '@/hooks/useClientBalance';
import { AddBalanceDialog } from '@/components/balance/AddBalanceDialog';
import { TransactionHistoryDialog } from '@/components/balance/TransactionHistoryDialog';
 import { useQueryClient } from '@tanstack/react-query';

interface BalancePageProps {
  client: Client;
}

export const BalancePage = ({ client }: BalancePageProps) => {
  const [addBalanceOpen, setAddBalanceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
   const [searchParams, setSearchParams] = useSearchParams();
   const queryClient = useQueryClient();

  const { data: balance, isLoading: balanceLoading } = useClientBalance(client.id);
  const { data: transactions, isLoading: transactionsLoading } = useBalanceTransactions(client.id, { limit: 10 });
  const { data: todayFees } = useTodayFees(client.id);
  const { data: monthStats } = useMonthlyFeeStats(client.id);

   // Handle payment return from Asaas
   useEffect(() => {
     const paymentStatus = searchParams.get('payment');
     
     if (paymentStatus === 'success') {
       toast.success('Pagamento realizado! Seu saldo será atualizado em instantes.');
       // Refresh balance data
       queryClient.invalidateQueries({ queryKey: ['client_balance'] });
       queryClient.invalidateQueries({ queryKey: ['balance_transactions'] });
       // Clear the query param
       searchParams.delete('payment');
       setSearchParams(searchParams, { replace: true });
     } else if (paymentStatus === 'cancelled') {
       toast.error('Pagamento cancelado.');
       searchParams.delete('payment');
       setSearchParams(searchParams, { replace: true });
     }
   }, [searchParams, setSearchParams, queryClient]);
 
  const isLoading = balanceLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saldo e Taxas</h1>
          <p className="text-muted-foreground">Gerencie seu saldo e visualize suas taxas</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const currentBalance = Number(balance?.balance) || 0;
  const currentDebt = Number(balance?.debt_amount) || 0;
  const isBlocked = balance?.is_blocked || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">💰 Saldo e Taxas</h1>
          <p className="text-muted-foreground">Gerencie seu saldo e visualize suas taxas de plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setHistoryOpen(true)}>
            <History className="h-4 w-4 mr-2" />
            Ver Histórico
          </Button>
          <Button onClick={() => setAddBalanceOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Saldo
          </Button>
        </div>
      </div>

      {/* Blocked Warning */}
      {isBlocked && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Seu bot está suspenso!</p>
              <p className="text-sm text-muted-foreground">
                Regularize sua dívida de R$ {currentDebt.toFixed(2)} para reativar.
              </p>
            </div>
            <Button variant="destructive" className="ml-auto" onClick={() => setAddBalanceOpen(true)}>
              Pagar Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {currentBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível para taxas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxas Hoje</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(todayFees?.total || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayFees?.count || 0} vendas
            </p>
          </CardContent>
        </Card>

        <Card className={currentDebt > 0 ? 'border-red-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívida</CardTitle>
            <TrendingDown className={`h-4 w-4 ${currentDebt > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentDebt > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              R$ {currentDebt.toFixed(2)}
            </div>
            {currentDebt > 0 && balance?.debt_started_at && (
              <p className="text-xs text-red-500">
                Desde {format(new Date(balance.debt_started_at), "dd/MM", { locale: ptBR })}
              </p>
            )}
            {currentDebt === 0 && (
              <p className="text-xs text-muted-foreground">Tudo em dia! ✅</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Resumo do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{monthStats?.salesCount || 0}</div>
              <div className="text-sm text-muted-foreground">Vendas</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">R$ {(monthStats?.totalFees || 0).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Taxas Totais</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">R$ {(monthStats?.paidFees || 0).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Taxas Pagas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Últimas Transações</CardTitle>
          <CardDescription>Movimentações recentes do seu saldo</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      Number(tx.amount) > 0 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {Number(tx.amount) > 0 ? <Plus className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description || 'Transação'}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(tx.amount) > 0 ? '+' : ''}R$ {Math.abs(Number(tx.amount)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma transação ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddBalanceDialog 
        open={addBalanceOpen} 
        onOpenChange={setAddBalanceOpen}
        clientId={client.id}
        currentDebt={currentDebt}
      />
      
      <TransactionHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        clientId={client.id}
      />
    </div>
  );
};
