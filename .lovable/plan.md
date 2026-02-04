
# Sistema de Cobranca Automatica de Taxas por Venda

## Resumo Executivo

Sistema de billing automatico que cobra R$ 0,70 por venda concluida (paid/delivered), permitindo que clientes paguem via saldo pre-carregado, cartao de credito ou PIX no dia seguinte. Inclui bloqueio automatico do bot apos inadimplencia e dashboard completo para administracao.

---

## Arquitetura do Sistema

```text
+------------------+     +-------------------+     +------------------+
|   Venda Paga     | --> | Registra Taxa     | --> | Debita do Saldo  |
| (fastsoft-webhook)|    | (platform_fees)   |     | (se disponivel)  |
+------------------+     +-------------------+     +------------------+
                                                           |
                         +----------------------------------+
                         v                                  v
               [Saldo suficiente]              [Saldo insuficiente]
                         |                                  |
                         v                                  v
               Taxa paga                        Acumula divida
               automaticamente                  (debt_amount)
                                                           |
+------------------+                             +---------v--------+
|  CRON Diario     | <---------------------------| Cobranca Diaria  |
|  00:05 BRT       |                             | (PIX ou Stripe)  |
+------------------+                             +------------------+
         |
         v
+------------------+     +------------------+
| Verifica         | --> | Bloqueia bot se  |
| Inadimplentes    |     | divida > X dias  |
+------------------+     +------------------+
```

---

## Fase 1: Estrutura de Dados

### 1.1 Nova Tabela: `client_balances`

Armazena saldo e divida de cada cliente.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| client_id | uuid | FK para clients (unique) |
| balance | numeric | Saldo pre-pago disponivel |
| debt_amount | numeric | Divida acumulada pendente |
| last_fee_date | timestamptz | Ultima data com taxas cobradas |
| debt_started_at | timestamptz | Quando a divida comecou (para bloqueio) |
| is_blocked | boolean | Se bot esta bloqueado por inadimplencia |
| blocked_at | timestamptz | Data do bloqueio |
| created_at | timestamptz | - |
| updated_at | timestamptz | - |

### 1.2 Nova Tabela: `platform_fees`

Registra cada taxa cobrada por venda.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| client_id | uuid | FK para clients |
| order_id | uuid | FK para orders |
| amount | numeric | Valor da taxa (0.70) |
| status | text | pending / paid / deducted_from_balance |
| paid_at | timestamptz | Quando foi paga |
| created_at | timestamptz | - |

### 1.3 Nova Tabela: `balance_transactions`

Historico de todas as movimentacoes de saldo.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| client_id | uuid | FK para clients |
| type | text | credit / debit / fee_deduction |
| amount | numeric | Valor da transacao |
| description | text | Descricao da movimentacao |
| reference_id | uuid | ID da taxa/pedido relacionado |
| payment_method | text | pix / stripe / admin_adjustment |
| created_at | timestamptz | - |

### 1.4 Nova Tabela: `daily_fee_invoices`

Faturas diarias consolidadas para cobranca.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| client_id | uuid | FK para clients |
| invoice_date | date | Data da fatura |
| total_fees | numeric | Total de taxas do dia |
| fees_count | integer | Quantidade de vendas |
| status | text | pending / paid / overdue |
| payment_id | text | ID do pagamento (PIX/Stripe) |
| pix_code | text | Codigo PIX gerado |
| due_date | date | Data limite para pagamento |
| paid_at | timestamptz | Quando foi paga |
| created_at | timestamptz | - |

### 1.5 Alteracao: Tabela `clients`

Adicionar colunas:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| fee_rate | numeric | Taxa por venda (default 0.70, pode variar por plano) |
| max_debt_days | integer | Dias antes de bloquear (default 3) |
| stripe_customer_id | text | ID do cliente no Stripe |
| default_payment_method | text | pix / stripe |

---

## Fase 2: Backend (Edge Functions)

### 2.1 Modificar: `fastsoft-webhook/index.ts`

Apos confirmar pagamento de venda:

```typescript
// Apos atualizar status para 'paid'
await registerPlatformFee(clientId, orderId, feeRate);

async function registerPlatformFee(clientId, orderId, rate = 0.70) {
  // 1. Criar registro de taxa
  const { data: fee } = await supabase
    .from('platform_fees')
    .insert({
      client_id: clientId,
      order_id: orderId,
      amount: rate,
      status: 'pending'
    })
    .select()
    .single();
  
  // 2. Verificar saldo disponivel
  const { data: balance } = await supabase
    .from('client_balances')
    .select('*')
    .eq('client_id', clientId)
    .single();
  
  if (balance && balance.balance >= rate) {
    // Debitar do saldo
    await supabase.from('client_balances')
      .update({ balance: balance.balance - rate })
      .eq('client_id', clientId);
    
    await supabase.from('platform_fees')
      .update({ status: 'deducted_from_balance', paid_at: now })
      .eq('id', fee.id);
    
    // Registrar transacao
    await supabase.from('balance_transactions').insert({
      client_id: clientId,
      type: 'fee_deduction',
      amount: -rate,
      description: `Taxa de venda - Pedido #${orderId.slice(0,8)}`,
      reference_id: fee.id
    });
  } else {
    // Acumular na divida
    const newDebt = (balance?.debt_amount || 0) + rate;
    await supabase.from('client_balances')
      .upsert({
        client_id: clientId,
        debt_amount: newDebt,
        debt_started_at: balance?.debt_started_at || new Date()
      });
  }
}
```

### 2.2 Nova Function: `process-daily-fees/index.ts`

Executada via CRON diariamente as 00:05 BRT.

```typescript
// Pseudo-codigo
async function processDailyFees() {
  // 1. Buscar clientes com divida pendente
  const clients = await getClientsWithDebt();
  
  for (const client of clients) {
    // 2. Consolidar taxas do dia anterior
    const fees = await getPendingFees(client.id);
    
    if (fees.length > 0) {
      // 3. Criar fatura diaria
      const invoice = await createDailyInvoice(client.id, fees);
      
      // 4. Gerar cobranca (PIX ou Stripe)
      if (client.default_payment_method === 'stripe') {
        await chargeStripe(client, invoice);
      } else {
        await generatePixInvoice(client, invoice);
      }
      
      // 5. Enviar notificacao
      await notifyClient(client, invoice);
    }
  }
  
  // 6. Verificar inadimplentes
  await checkAndBlockDelinquents();
}

async function checkAndBlockDelinquents() {
  const delinquents = await supabase.from('client_balances')
    .select('*, clients(*)')
    .gt('debt_amount', 0)
    .is('is_blocked', false);
  
  for (const d of delinquents) {
    const daysSinceDebt = daysDiff(d.debt_started_at, now);
    if (daysSinceDebt >= d.clients.max_debt_days) {
      await supabase.from('client_balances')
        .update({ is_blocked: true, blocked_at: now })
        .eq('id', d.id);
      
      // Notificar admin e cliente
      await notifyBlocked(d.clients);
    }
  }
}
```

### 2.3 Nova Function: `add-balance/index.ts`

Permite cliente adicionar saldo via PIX ou Stripe.

```typescript
// POST: { clientId, amount, method: 'pix' | 'stripe' }
if (method === 'stripe') {
  // Criar Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'brl',
    customer: client.stripe_customer_id,
    metadata: { client_id: clientId, type: 'balance_topup' }
  });
  return { clientSecret: paymentIntent.client_secret };
} else {
  // Gerar PIX via UniPay
  const pix = await generatePix(amount, { client_id: clientId });
  return { pixCode: pix.code, pixQrcode: pix.qrcode };
}
```

### 2.4 Modificar: `telegram-bot/index.ts`

Verificar bloqueio antes de processar comandos:

```typescript
// No inicio do handler
const { data: balance } = await supabase
  .from('client_balances')
  .select('is_blocked')
  .eq('client_id', clientId)
  .single();

if (balance?.is_blocked) {
  return sendMessage(chatId, 
    '⚠️ Este bot esta temporariamente suspenso.\n' +
    'O proprietario precisa regularizar pendencias financeiras.');
}
```

---

## Fase 3: Interface do Cliente

### 3.1 Nova Pagina: `src/pages/dashboard/BalancePage.tsx`

```text
+----------------------------------------------------------+
|  💰 Saldo e Taxas                                        |
+----------------------------------------------------------+
|                                                          |
|  +---------------+  +---------------+  +---------------+ |
|  | Saldo Atual   |  | Taxas Hoje    |  | Divida        | |
|  | R$ 45,00      |  | R$ 4,90 (7)   |  | R$ 0,00       | |
|  +---------------+  +---------------+  +---------------+ |
|                                                          |
|  [Adicionar Saldo]  [Ver Historico]                      |
|                                                          |
|  📊 Resumo do Mes                                        |
|  +--------------------------------------------------+   |
|  | Vendas: 142  |  Taxas: R$ 99,40  |  Pago: R$ 85  |   |
|  +--------------------------------------------------+   |
|                                                          |
|  📋 Ultimas Transacoes                                   |
|  +--------------------------------------------------+   |
|  | -R$ 0,70 | Taxa de venda #abc123 | Hoje 14:35    |   |
|  | +R$ 50,00| Recarga PIX           | Ontem         |   |
|  | -R$ 0,70 | Taxa de venda #def456 | Ontem         |   |
|  +--------------------------------------------------+   |
|                                                          |
+----------------------------------------------------------+
```

### 3.2 Componente: `AddBalanceDialog.tsx`

Modal para adicionar saldo com opcoes:
- PIX: Gera QR Code para pagamento
- Cartao: Integra com Stripe Elements

### 3.3 Alerta de Divida

Banner vermelho no topo do dashboard quando cliente tem divida:

```text
+----------------------------------------------------------+
| ⚠️ Voce tem R$ 4,90 em taxas pendentes. [Pagar Agora]    |
+----------------------------------------------------------+
```

---

## Fase 4: Interface Admin

### 4.1 Modificar: `AdminClientsPage.tsx`

Adicionar colunas na tabela:

| Coluna Nova | Descricao |
|-------------|-----------|
| Saldo | R$ X,XX com cor verde |
| Divida | R$ X,XX com cor vermelha |
| Status | Ativo / Bloqueado badge |

### 4.2 Nova Pagina: `AdminBillingPage.tsx`

Dashboard financeiro completo:

```text
+----------------------------------------------------------+
|  💳 Financeiro - Taxas da Plataforma                     |
+----------------------------------------------------------+
|                                                          |
|  +---------------+  +---------------+  +---------------+ |
|  | Taxas Hoje    |  | Taxas Mes     |  | Inadimplentes | |
|  | R$ 87,50 (125)|  | R$ 2.450      |  | 3 clientes    | |
|  +---------------+  +---------------+  +---------------+ |
|                                                          |
|  📈 Taxas por Dia (Grafico)                              |
|  [========================================]               |
|                                                          |
|  📋 Clientes com Pendencias                              |
|  +--------------------------------------------------+   |
|  | Cliente     | Divida    | Desde    | Acao        |   |
|  | Loja ABC    | R$ 12,60  | 2 dias   | [Cobrar]    |   |
|  | Store XYZ   | R$ 45,50  | 5 dias   | [Bloqueado] |   |
|  +--------------------------------------------------+   |
|                                                          |
|  📋 Ultimos Pagamentos de Taxa                           |
|  +--------------------------------------------------+   |
|  | Cliente     | Valor     | Metodo   | Data        |   |
|  | Loja 123    | R$ 35,00  | PIX      | Hoje 10:00  |   |
|  +--------------------------------------------------+   |
|                                                          |
+----------------------------------------------------------+
```

### 4.3 Acoes Admin

- Ajustar saldo manualmente (creditar/debitar)
- Desbloquear cliente
- Alterar taxa por venda
- Ver historico completo
- Enviar cobranca manual

---

## Fase 5: Integracoes

### 5.1 Stripe (Cartao de Credito)

```text
1. Cliente cadastra cartao (Stripe Elements)
2. Salva payment method no Stripe Customer
3. Cobranca automatica diaria (se configurado)
4. Webhook recebe confirmacao
5. Atualiza saldo/divida
```

### 5.2 UniPay (PIX)

```text
1. Gera PIX com valor da divida
2. Envia para cliente (email/push)
3. Webhook recebe confirmacao
4. Atualiza saldo/divida
```

### 5.3 Notificacoes

- Push notification quando divida > 0
- Email diario com resumo de taxas
- Alerta 24h antes do bloqueio
- Notificacao de bloqueio

---

## Fase 6: CRON Jobs

### 6.1 Consolidacao Diaria (00:05 BRT)

```sql
SELECT cron.schedule(
  'process-daily-fees',
  '5 3 * * *', -- 00:05 BRT = 03:05 UTC
  $$
  SELECT net.http_post(
    url := 'https://[project].supabase.co/functions/v1/process-daily-fees',
    headers := '{"Authorization": "Bearer [ANON_KEY]"}'::jsonb
  );
  $$
);
```

### 6.2 Verificacao de Inadimplentes (06:00 BRT)

```sql
SELECT cron.schedule(
  'check-delinquents',
  '0 9 * * *', -- 06:00 BRT = 09:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://[project].supabase.co/functions/v1/check-delinquents',
    headers := '{"Authorization": "Bearer [ANON_KEY]"}'::jsonb
  );
  $$
);
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| Migracao SQL | Criar | Tabelas client_balances, platform_fees, etc |
| `supabase/functions/process-daily-fees/` | Criar | CRON de processamento diario |
| `supabase/functions/add-balance/` | Criar | Adicionar saldo |
| `supabase/functions/check-delinquents/` | Criar | Verificar inadimplentes |
| `supabase/functions/stripe-billing-webhook/` | Criar | Webhook do Stripe |
| `supabase/functions/fastsoft-webhook/` | Modificar | Registrar taxa apos venda |
| `supabase/functions/telegram-bot/` | Modificar | Verificar bloqueio |
| `src/pages/dashboard/BalancePage.tsx` | Criar | Pagina de saldo do cliente |
| `src/components/balance/` | Criar | Componentes de saldo |
| `src/pages/admin/AdminBillingPage.tsx` | Criar | Dashboard financeiro admin |
| `src/pages/admin/AdminClientsPage.tsx` | Modificar | Adicionar colunas saldo/divida |
| `src/hooks/useClientBalance.tsx` | Criar | Hook para saldo do cliente |
| `src/hooks/useAdminBilling.tsx` | Criar | Hook para dados de billing |
| `src/components/dashboard/DebtBanner.tsx` | Criar | Banner de alerta de divida |

---

## Configuracoes por Plano

| Plano | Taxa por Venda | Dias para Bloqueio |
|-------|----------------|-------------------|
| Free | R$ 0,80 | 2 dias |
| Basic | R$ 0,60 | 3 dias |
| Pro | R$ 0,50 | 5 dias |
| Enterprise | Customizado | Customizado |

---

## Proximos Passos

1. Criar migracoes SQL com todas as tabelas
2. Implementar registro de taxa no webhook de pagamento
3. Criar edge function de processamento diario
4. Desenvolver interface de saldo do cliente
5. Desenvolver interface admin de billing
6. Integrar Stripe para pagamentos com cartao
7. Configurar CRON jobs
8. Testar fluxo completo
