import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BalanceTransaction } from '@/hooks/useClientBalance';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';

interface BalanceChartProps {
  transactions: BalanceTransaction[];
  currentBalance: number;
}

export const BalanceChart = ({ transactions, currentBalance }: BalanceChartProps) => {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = 30;

    // Group transactions by day
    const dailyMap = new Map<string, { credits: number; debits: number }>();

    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i);
      const key = format(date, 'yyyy-MM-dd');
      dailyMap.set(key, { credits: 0, debits: 0 });
    }

    transactions.forEach((tx) => {
      const key = format(new Date(tx.created_at), 'yyyy-MM-dd');
      const entry = dailyMap.get(key);
      if (entry) {
        const amount = Number(tx.amount);
        if (amount > 0) entry.credits += amount;
        else entry.debits += Math.abs(amount);
      }
    });

    // Calculate running balance backwards from current
    const entries = Array.from(dailyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    // Work backwards: current balance is today, subtract net changes going back
    let runningBalance = currentBalance;
    const result: { date: string; label: string; saldo: number; creditos: number; debitos: number }[] = [];

    // First pass: calculate net per day going forward
    for (let i = entries.length - 1; i >= 0; i--) {
      const [dateStr, { credits, debits }] = entries[i];
      result.unshift({
        date: dateStr,
        label: format(new Date(dateStr + 'T12:00:00'), 'dd/MM', { locale: ptBR }),
        saldo: runningBalance,
        creditos: credits,
        debitos: debits,
      });
      runningBalance = runningBalance - credits + debits;
    }

    return result;
  }, [transactions, currentBalance]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-border/50 bg-card p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          Saldo: R$ {payload[0]?.value?.toFixed(2)}
        </p>
        {payload[0]?.payload?.creditos > 0 && (
          <p className="text-xs text-green-500">+ R$ {payload[0].payload.creditos.toFixed(2)}</p>
        )}
        {payload[0]?.payload?.debitos > 0 && (
          <p className="text-xs text-red-500">- R$ {payload[0].payload.debitos.toFixed(2)}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.5} />
        <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Clash Display, sans-serif' }}>
          Evolução do Saldo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `R$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="hsl(var(--primary))"
                fill="url(#balanceGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
