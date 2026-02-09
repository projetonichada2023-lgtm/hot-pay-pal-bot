import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DailyFeeInvoice } from '@/hooks/useClientBalance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText } from 'lucide-react';

interface DailyInvoicesTableProps {
  invoices: DailyFeeInvoice[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'Pago', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  pending: { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  overdue: { label: 'Vencido', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export const DailyInvoicesTable = ({ invoices }: DailyInvoicesTableProps) => {
  if (!invoices?.length) return null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <FileText className="h-4 w-4 text-primary" strokeWidth={1.5} />
        <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Clash Display, sans-serif' }}>
          Faturas Diárias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Data</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Vendas</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Taxas</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 10).map((invoice) => {
                const status = statusConfig[invoice.status] || statusConfig.pending;
                return (
                  <tr key={invoice.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-medium">
                      {format(new Date(invoice.invoice_date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground">
                      {invoice.fees_count}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      R$ {Number(invoice.total_fees).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
