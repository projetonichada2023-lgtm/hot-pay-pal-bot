import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ClientBalance {
  id: string;
  client_id: string;
  balance: number;
  debt_amount: number;
  last_fee_date: string | null;
  debt_started_at: string | null;
  is_blocked: boolean;
  blocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformFee {
  id: string;
  client_id: string;
  order_id: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface BalanceTransaction {
  id: string;
  client_id: string;
  type: string;
  amount: number;
  description: string | null;
  reference_id: string | null;
  payment_method: string | null;
  created_at: string;
}

export interface DailyFeeInvoice {
  id: string;
  client_id: string;
  invoice_date: string;
  total_fees: number;
  fees_count: number;
  status: string;
  payment_id: string | null;
  pix_code: string | null;
  pix_qrcode: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

// Hook para obter saldo do cliente
export const useClientBalance = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['client_balance', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_balances')
        .select('*')
        .eq('client_id', clientId!)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as ClientBalance | null;
    },
    enabled: !!clientId,
  });
};

// Hook para obter taxas de plataforma do cliente
export const usePlatformFees = (clientId: string | undefined, options?: { limit?: number }) => {
  return useQuery({
    queryKey: ['platform_fees', clientId, options?.limit],
    queryFn: async () => {
      let query = supabase
        .from('platform_fees')
        .select('*')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PlatformFee[];
    },
    enabled: !!clientId,
  });
};

// Hook para obter transações de saldo
export const useBalanceTransactions = (clientId: string | undefined, options?: { limit?: number }) => {
  return useQuery({
    queryKey: ['balance_transactions', clientId, options?.limit],
    queryFn: async () => {
      let query = supabase
        .from('balance_transactions')
        .select('*')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BalanceTransaction[];
    },
    enabled: !!clientId,
  });
};

// Hook para obter faturas diárias
export const useDailyInvoices = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['daily_invoices', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_fee_invoices')
        .select('*')
        .eq('client_id', clientId!)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      return data as DailyFeeInvoice[];
    },
    enabled: !!clientId,
  });
};

// Hook para estatísticas do mês
export const useMonthlyFeeStats = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['monthly_fee_stats', clientId],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: fees, error } = await supabase
        .from('platform_fees')
        .select('amount, status, created_at')
        .eq('client_id', clientId!)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const totalFees = fees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
      const paidFees = fees?.filter(f => f.status !== 'pending').reduce((sum, f) => sum + Number(f.amount), 0) || 0;
      const salesCount = fees?.length || 0;

      return {
        totalFees,
        paidFees,
        salesCount,
      };
    },
    enabled: !!clientId,
  });
};

// Hook para taxas de hoje
export const useTodayFees = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['today_fees', clientId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('platform_fees')
        .select('amount')
        .eq('client_id', clientId!)
        .gte('created_at', today.toISOString());

      if (error) throw error;

      const total = data?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
      const count = data?.length || 0;

      return { total, count };
    },
    enabled: !!clientId,
  });
};

// Mutation para adicionar saldo via PIX ou Cartão
export const useAddBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, amount, method = 'pix', cpfCnpj }: { clientId: string; amount: number; method?: 'pix' | 'card'; cpfCnpj?: string }) => {
      const { data, error } = await supabase.functions.invoke('add-balance', {
        body: { clientId, amount, method, cpfCnpj },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.pixCode) {
        toast.success('PIX gerado com sucesso!');
      } else if (data.invoiceUrl) {
        // Card payment - handled in component
      }
    },
    onError: (error: Error) => {
      console.error('Error adding balance:', error);
      toast.error('Erro ao processar pagamento');
    },
  });
};
