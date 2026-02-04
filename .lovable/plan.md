
# Plano: Pagamento de Taxas por PIX/Cartao e Menu Financeiro na Sidebar

## Resumo

Implementar duas mudanças:
1. Adicionar item "Financeiro" na sidebar do dashboard apontando para a pagina de saldo/taxas
2. Habilitar pagamento por cartao de credito usando a integracao Stripe do Lovable

---

## Fase 1: Adicionar Menu Financeiro na Sidebar

### 1.1 Modificar Sidebar.tsx

Adicionar o item de menu para a pagina financeira que ja existe:

```text
Antes (menuItems):
- Dashboard
- Conversas
- Mensagens Bot
- Produtos
- Funil
- Pedidos
- Recuperacao
- Clientes
- Tracking
- Relatorios
- Meus Bots
- Simulador
- Configuracoes

Depois (menuItems):
- Dashboard
- Conversas
- Mensagens Bot
- Produtos
- Funil
- Pedidos
- Recuperacao
- Clientes
- Tracking
- Relatorios
- Financeiro  <-- NOVO (icone: Wallet)
- Meus Bots
- Simulador
- Configuracoes
```

**Arquivo**: `src/components/dashboard/Sidebar.tsx`
- Importar icone `Wallet` do lucide-react
- Adicionar item no array `menuItems`:
  ```typescript
  { icon: Wallet, label: 'Financeiro', path: '/dashboard/balance' }
  ```

---

## Fase 2: Habilitar Pagamento por Cartao (Stripe)

### 2.1 Pre-requisito: Ativar Integracao Stripe

O Lovable possui integracao nativa com Stripe. Sera necessario:
1. Ativar a integracao Stripe no projeto
2. Configurar a chave secreta (STRIPE_SECRET_KEY)

### 2.2 Fluxo de Pagamento por Cartao

```text
+-------------------+     +------------------+     +------------------+
| Cliente escolhe   | --> | Edge Function    | --> | Stripe API       |
| pagar com cartao  |     | add-balance      |     | Checkout Session |
+-------------------+     +------------------+     +------------------+
                                                           |
                                                           v
                                              +------------------------+
                                              | Redireciona para       |
                                              | Stripe Checkout        |
                                              +------------------------+
                                                           |
+-------------------+     +------------------+             |
| Saldo creditado   | <-- | Webhook Stripe   | <-----------+
|                   |     | stripe-webhook   | (checkout.session.completed)
+-------------------+     +------------------+
```

### 2.3 Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/functions/add-balance/index.ts` | Modificar | Adicionar criacao de Checkout Session do Stripe |
| `supabase/functions/stripe-balance-webhook/index.ts` | Criar | Processar webhooks de pagamento confirmado |
| `src/components/balance/AddBalanceDialog.tsx` | Modificar | Habilitar aba de cartao e redirecionar para checkout |
| `src/hooks/useClientBalance.tsx` | Modificar | Adicionar mutation para pagamento por cartao |

### 2.4 Edge Function: add-balance (modificacoes)

Adicionar handler para method === 'stripe':

```typescript
if (method === 'stripe') {
  const stripe = new Stripe(STRIPE_SECRET_KEY);
  
  // Criar Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: {
          name: 'Recarga de Saldo - Taxas Conversy',
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${APP_URL}/dashboard/balance?payment=success`,
    cancel_url: `${APP_URL}/dashboard/balance?payment=cancelled`,
    metadata: {
      client_id: clientId,
      type: 'balance_topup',
    },
  });

  return { 
    success: true, 
    method: 'stripe',
    checkoutUrl: session.url 
  };
}
```

### 2.5 Edge Function: stripe-balance-webhook (nova)

Processar eventos de pagamento:

```typescript
// Eventos a processar:
// - checkout.session.completed

// Ao receber pagamento:
// 1. Extrair client_id dos metadata
// 2. Creditar saldo usando addCreditToBalance()
// 3. Atualizar status da transacao
```

### 2.6 Frontend: AddBalanceDialog

Modificar a aba de cartao para:
1. Remover `disabled` do TabsTrigger
2. Adicionar formulario com botao "Pagar com Cartao"
3. Ao clicar, chamar edge function e redirecionar para checkoutUrl

---

## Detalhes Tecnicos

### Secrets Necessarias

| Secret | Descricao |
|--------|-----------|
| STRIPE_SECRET_KEY | Chave secreta da conta Stripe |

### URL do Webhook Stripe

Configurar no dashboard do Stripe:
```
https://ufyvllgimtkyehfkfxoi.supabase.co/functions/v1/stripe-balance-webhook
```

### Eventos Stripe a Monitorar

- `checkout.session.completed` - Pagamento confirmado

---

## Ordem de Implementacao

1. Adicionar item "Financeiro" na Sidebar
2. Ativar integracao Stripe (requer chave da API)
3. Modificar edge function add-balance para Stripe
4. Criar edge function stripe-balance-webhook
5. Atualizar frontend para usar Stripe Checkout
6. Testar fluxo completo

---

## Interface Final

### Dialog de Adicionar Saldo

```text
+----------------------------------+
| Adicionar Saldo                  |
+----------------------------------+
|  [PIX]  [Cartao]                 |
+----------------------------------+
| Valor: R$ [50.00]                |
|                                  |
| [R$20] [R$50] [R$100] [R$200]    |
|                                  |
| [   Pagar com Cartao   ]         |
+----------------------------------+
```

Ao clicar em "Pagar com Cartao", o usuario sera redirecionado para a pagina de checkout seguro do Stripe.
