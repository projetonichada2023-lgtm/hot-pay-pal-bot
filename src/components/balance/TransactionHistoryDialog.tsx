import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, TrendingDown, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBalanceTransactions } from '@/hooks/useClientBalance';

interface TransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export const TransactionHistoryDialog = ({
  open,
  onOpenChange,
  clientId,
}: TransactionHistoryDialogProps) => {
  const { data: transactions, isLoading } = useBalanceTransactions(clientId, { limit: 100 });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'credit':
        return <Badge className="bg-green-500/10 text-green-500">Crédito</Badge>;
      case 'debit':
        return <Badge className="bg-red-500/10 text-red-500">Débito</Badge>;
      case 'fee_deduction':
        return <Badge className="bg-blue-500/10 text-blue-500">Taxa</Badge>;
      case 'debt_payment':
        return <Badge className="bg-orange-500/10 text-orange-500">Pag. Dívida</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'stripe':
        return 'Cartão';
      case 'admin_adjustment':
        return 'Ajuste Admin';
      case 'balance':
        return 'Saldo';
      default:
        return method || '-';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>📋 Histórico de Transações</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        Number(tx.amount) > 0
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {Number(tx.amount) > 0 ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">
                        {tx.description || 'Transação'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeBadge(tx.type)}
                        <span className="text-xs text-muted-foreground">
                          {getPaymentMethodLabel(tx.payment_method)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(tx.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-lg ${
                      Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Number(tx.amount) > 0 ? '+' : ''}R${' '}
                    {Math.abs(Number(tx.amount)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma transação encontrada</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
