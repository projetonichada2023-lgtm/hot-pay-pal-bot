-- =====================================================
-- Sistema de Cobrança Automática de Taxas por Venda
-- =====================================================

-- 1. Adicionar colunas na tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS fee_rate numeric DEFAULT 0.70,
ADD COLUMN IF NOT EXISTS max_debt_days integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS default_payment_method text DEFAULT 'pix';

-- 2. Criar tabela client_balances (saldo e dívida de cada cliente)
CREATE TABLE public.client_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  debt_amount numeric NOT NULL DEFAULT 0,
  last_fee_date timestamptz,
  debt_started_at timestamptz,
  is_blocked boolean NOT NULL DEFAULT false,
  blocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Criar enum para status de taxa
DO $$ BEGIN
  CREATE TYPE platform_fee_status AS ENUM ('pending', 'paid', 'deducted_from_balance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. Criar tabela platform_fees (registro de cada taxa por venda)
CREATE TABLE public.platform_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0.70,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Criar enum para tipo de transação de saldo
DO $$ BEGIN
  CREATE TYPE balance_transaction_type AS ENUM ('credit', 'debit', 'fee_deduction', 'debt_payment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 6. Criar tabela balance_transactions (histórico de movimentações)
CREATE TABLE public.balance_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  reference_id uuid,
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Criar enum para status de fatura
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 8. Criar tabela daily_fee_invoices (faturas diárias consolidadas)
CREATE TABLE public.daily_fee_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_date date NOT NULL,
  total_fees numeric NOT NULL DEFAULT 0,
  fees_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_id text,
  pix_code text,
  pix_qrcode text,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, invoice_date)
);

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_client_balances_client_id ON public.client_balances(client_id);
CREATE INDEX IF NOT EXISTS idx_client_balances_is_blocked ON public.client_balances(is_blocked);
CREATE INDEX IF NOT EXISTS idx_client_balances_debt ON public.client_balances(debt_amount) WHERE debt_amount > 0;

CREATE INDEX IF NOT EXISTS idx_platform_fees_client_id ON public.platform_fees(client_id);
CREATE INDEX IF NOT EXISTS idx_platform_fees_status ON public.platform_fees(status);
CREATE INDEX IF NOT EXISTS idx_platform_fees_created_at ON public.platform_fees(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_fees_order_id ON public.platform_fees(order_id);

CREATE INDEX IF NOT EXISTS idx_balance_transactions_client_id ON public.balance_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON public.balance_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_fee_invoices_client_id ON public.daily_fee_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_daily_fee_invoices_status ON public.daily_fee_invoices(status);
CREATE INDEX IF NOT EXISTS idx_daily_fee_invoices_date ON public.daily_fee_invoices(invoice_date);

-- 10. Habilitar RLS em todas as tabelas
ALTER TABLE public.client_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_fee_invoices ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies para client_balances
CREATE POLICY "Clients can view their own balance"
ON public.client_balances FOR SELECT
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all balances"
ON public.client_balances FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 12. RLS Policies para platform_fees
CREATE POLICY "Clients can view their own fees"
ON public.platform_fees FOR SELECT
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all fees"
ON public.platform_fees FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 13. RLS Policies para balance_transactions
CREATE POLICY "Clients can view their own transactions"
ON public.balance_transactions FOR SELECT
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all transactions"
ON public.balance_transactions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 14. RLS Policies para daily_fee_invoices
CREATE POLICY "Clients can view their own invoices"
ON public.daily_fee_invoices FOR SELECT
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all invoices"
ON public.daily_fee_invoices FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 15. Trigger para updated_at em client_balances
CREATE TRIGGER update_client_balances_updated_at
BEFORE UPDATE ON public.client_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Função para criar client_balance automaticamente quando cliente é criado
CREATE OR REPLACE FUNCTION public.create_client_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.client_balances (client_id)
  VALUES (NEW.id)
  ON CONFLICT (client_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 17. Trigger para criar balance quando cliente é criado
CREATE TRIGGER create_client_balance_trigger
AFTER INSERT ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.create_client_balance();

-- 18. Criar balances para clientes existentes
INSERT INTO public.client_balances (client_id)
SELECT id FROM public.clients
WHERE id NOT IN (SELECT client_id FROM public.client_balances)
ON CONFLICT (client_id) DO NOTHING;