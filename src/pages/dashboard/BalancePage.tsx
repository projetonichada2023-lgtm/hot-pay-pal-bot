import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  TrendingDown, 
  Receipt, 
  Clock, 
  Plus, 
  History,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Client } from '@/hooks/useClient';
import { 
  useClientBalance, 
  useBalanceTransactions, 
  useTodayFees, 
  useMonthlyFeeStats,
  useDailyInvoices
} from '@/hooks/useClientBalance';
import { AddBalanceDialog } from '@/components/balance/AddBalanceDialog';
import { TransactionHistoryDialog } from '@/components/balance/TransactionHistoryDialog';
import { BalanceChart } from '@/components/balance/BalanceChart';
import { DailyInvoicesTable } from '@/components/balance/DailyInvoicesTable';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface BalancePageProps {
  client: Client;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0, 0, 0.2, 1] as const }
  })
};

export const BalancePage = ({ client }: BalancePageProps) => {
  const [addBalanceOpen, setAddBalanceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { data: balance, isLoading: balanceLoading } = useClientBalance(client.id);
  const { data: transactions, isLoading: transactionsLoading } = useBalanceTransactions(client.id, { limit: 10 });
  const { data: allTransactions } = useBalanceTransactions(client.id);
  const { data: todayFees } = useTodayFees(client.id);
  const { data: monthStats } = useMonthlyFeeStats(client.id);
  const { data: dailyInvoices } = useDailyInvoices(client.id);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Pagamento realizado! Seu saldo será atualizado em instantes.');
      queryClient.invalidateQueries({ queryKey: ['client_balance'] });
      queryClient.invalidateQueries({ queryKey: ['balance_transactions'] });
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
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Clash Display, sans-serif' }}>Financeiro</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const currentBalance = Number(balance?.balance) || 0;
  const currentDebt = Number(balance?.debt_amount) || 0;
  const isBlocked = balance?.is_blocked || false;

  const getSubtitle = () => {
    if (isBlocked) return 'Seu bot está suspenso. Regularize sua dívida para reativar.';
    if (currentDebt > 0) return 'Você possui uma dívida pendente. Regularize para evitar bloqueio.';
    return 'Gerencie seu saldo e acompanhe suas taxas da plataforma';
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) return <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />;
    return <ArrowDownRight className="h-4 w-4" strokeWidth={1.5} />;
  };

  const getPaymentMethodBadge = (method: string | null) => {
    if (!method) return null;
    const config: Record<string, { icon: React.ReactNode; label: string }> = {
      pix: { icon: <QrCode className="h-3 w-3" />, label: 'PIX' },
      card: { icon: <CreditCard className="h-3 w-3" />, label: 'Cartão' },
    };
    const m = config[method];
    if (!m) return null;
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded">
        {m.icon} {m.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              Financeiro
            </h1>
            <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
          <Button size="sm" onClick={() => setAddBalanceOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Saldo
          </Button>
        </div>
      </div>

      {/* Blocked Warning */}
      {isBlocked && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="font-semibold text-destructive text-sm">Bot suspenso por inadimplência</p>
                <p className="text-xs text-muted-foreground">
                  Dívida de R$ {currentDebt.toFixed(2)} — regularize para reativar
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setAddBalanceOpen(true)}>
                Pagar Agora
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Saldo Disponível',
            value: `R$ ${currentBalance.toFixed(2)}`,
            subtitle: 'Disponível para taxas',
            icon: Wallet,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Taxas Hoje',
            value: `R$ ${(todayFees?.total || 0).toFixed(2)}`,
            subtitle: `${todayFees?.count || 0} vendas hoje`,
            icon: Receipt,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Taxas do Mês',
            value: `R$ ${(monthStats?.totalFees || 0).toFixed(2)}`,
            subtitle: `${monthStats?.salesCount || 0} vendas no mês`,
            icon: Calendar,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            title: 'Dívida Pendente',
            value: `R$ ${currentDebt.toFixed(2)}`,
            subtitle: currentDebt > 0 && balance?.debt_started_at
              ? `Desde ${format(new Date(balance.debt_started_at), "dd/MM", { locale: ptBR })}`
              : 'Tudo em dia ✅',
            icon: TrendingDown,
            color: currentDebt > 0 ? 'text-destructive' : 'text-muted-foreground',
            bgColor: currentDebt > 0 ? 'bg-destructive/10' : 'bg-muted/50',
          },
        ].map((card, i) => (
          <motion.div key={card.title} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</span>
                  <div className={cn('p-1.5 rounded-lg', card.bgColor)}>
                    <card.icon className={cn('h-4 w-4', card.color)} strokeWidth={1.5} />
                  </div>
                </div>
                <p className={cn('text-2xl font-bold tracking-tight', card.color)} style={{ fontFamily: 'Clash Display, sans-serif' }}>
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart + Invoices Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BalanceChart transactions={allTransactions || []} currentBalance={currentBalance} />
        <DailyInvoicesTable invoices={dailyInvoices || []} />
      </div>

      {/* Recent Transactions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Últimas Transações
          </CardTitle>
          <CardDescription>Movimentações recentes do seu saldo</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx, i) => {
                const amount = Number(tx.amount);
                const isCredit = amount > 0;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-full',
                        isCredit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      )}>
                        {getTransactionIcon(tx.type, amount)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{tx.description || 'Transação'}</p>
                          {getPaymentMethodBadge(tx.payment_method)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <span className={cn('font-bold text-sm', isCredit ? 'text-green-500' : 'text-red-500')}>
                      {isCredit ? '+' : ''}R$ {Math.abs(amount).toFixed(2)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
              <p className="text-sm">Nenhuma transação ainda</p>
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
