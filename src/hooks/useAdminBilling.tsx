import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ClientWithBalance {
  id: string;
  business_name: string;
  business_email: string | null;
  fee_rate: number;
  max_debt_days: number;
  client_balances: {
    id: string;
    balance: number;
    debt_amount: number;
    is_blocked: boolean;
    debt_started_at: string | null;
    blocked_at: string | null;
  } | null;
}

export interface BillingStats {
  todayFees: number;
  todayCount: number;
  monthFees: number;
  monthCount: number;
  totalDebt: number;
  delinquentClients: number;
  blockedClients: number;
}

// Hook para estatísticas de billing (admin)
export const useAdminBillingStats = () => {
  return useQuery({
    queryKey: ['admin_billing_stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Buscar taxas de hoje
      const { data: todayFees } = await supabase
        .from('platform_fees')
        .select('amount')
        .gte('created_at', today.toISOString());

      // Buscar taxas do mês
      const { data: monthFees } = await supabase
        .from('platform_fees')
        .select('amount')
        .gte('created_at', startOfMonth.toISOString());

      // Buscar clientes com dívida
      const { data: balances } = await supabase
        .from('client_balances')
        .select('debt_amount, is_blocked')
        .gt('debt_amount', 0);

      const stats: BillingStats = {
        todayFees: todayFees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0,
        todayCount: todayFees?.length || 0,
        monthFees: monthFees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0,
        monthCount: monthFees?.length || 0,
        totalDebt: balances?.reduce((sum, b) => sum + Number(b.debt_amount), 0) || 0,
        delinquentClients: balances?.length || 0,
        blockedClients: balances?.filter(b => b.is_blocked).length || 0,
      };

      return stats;
    },
  });
};

// Hook para clientes com pendências (admin)
export const useDelinquentClients = () => {
  return useQuery({
    queryKey: ['delinquent_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          business_name,
          business_email,
          fee_rate,
          max_debt_days,
          client_balances!inner(
            id,
            balance,
            debt_amount,
            is_blocked,
            debt_started_at,
            blocked_at
          )
        `)
        .gt('client_balances.debt_amount', 0)
        .order('client_balances(debt_amount)', { ascending: false });

      if (error) throw error;

      // Flatten the structure
      return (data || []).map(client => ({
        ...client,
        client_balances: Array.isArray(client.client_balances) 
          ? client.client_balances[0] 
          : client.client_balances
      })) as ClientWithBalance[];
    },
  });
};

// Hook para todas as taxas recentes (admin)
export const useRecentPlatformFees = (limit: number = 50) => {
  return useQuery({
    queryKey: ['recent_platform_fees', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_fees')
        .select(`
          *,
          clients(business_name),
          orders(amount)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};

// Hook para transações de pagamento de taxa recentes
export const useRecentBalancePayments = (limit: number = 20) => {
  return useQuery({
    queryKey: ['recent_balance_payments', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('balance_transactions')
        .select(`
          *,
          clients(business_name)
        `)
        .eq('type', 'credit')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};

// Mutation para ações de admin no saldo
export const useAdminBalanceAction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      action: 'credit' | 'debit' | 'unblock' | 'adjust_fee_rate';
      clientId: string;
      amount?: number;
      feeRate?: number;
      description?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('admin-balance', {
        body: { ...params, adminUserId: user?.id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin_billing_stats'] });
      queryClient.invalidateQueries({ queryKey: ['delinquent_clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin_clients'] });

      switch (variables.action) {
        case 'credit':
          toast.success('Crédito adicionado com sucesso!');
          break;
        case 'debit':
          toast.success('Débito realizado com sucesso!');
          break;
        case 'unblock':
          toast.success('Cliente desbloqueado!');
          break;
        case 'adjust_fee_rate':
          toast.success('Taxa atualizada!');
          break;
      }
    },
    onError: (error: Error) => {
      console.error('Admin balance action error:', error);
      toast.error('Erro ao executar ação');
    },
  });
};

// Hook para gráfico de taxas por dia
export const useDailyFeesChart = (days: number = 30) => {
  return useQuery({
    queryKey: ['daily_fees_chart', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('platform_fees')
        .select('amount, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por dia
      const byDay: Record<string, { total: number; count: number }> = {};
      
      for (const fee of data || []) {
        const day = fee.created_at.split('T')[0];
        if (!byDay[day]) {
          byDay[day] = { total: 0, count: 0 };
        }
        byDay[day].total += Number(fee.amount);
        byDay[day].count += 1;
      }

      // Preencher dias sem dados
      const result = [];
      const currentDate = new Date(startDate);
      const endDate = new Date();

      while (currentDate <= endDate) {
        const dayStr = currentDate.toISOString().split('T')[0];
        result.push({
          date: dayStr,
          total: byDay[dayStr]?.total || 0,
          count: byDay[dayStr]?.count || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    },
  });
};
