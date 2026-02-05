
# Plano: Integracao Asaas para PIX e Cartao de Credito

## Situacao Atual

Apos analise do codigo, identifiquei:

| Item | Status Atual |
|------|--------------|
| Edge Function `add-balance` | Usa FastSoft para PIX, Stripe como TODO |
| Pagamento PIX | FastSoft (mock se nao configurado) |
| Pagamento Cartao | Nao implementado (retorna erro 501) |
| Webhook de Balance | Nao existe |
| Secret ASAAS_API_KEY | Nao configurada |

---

## Arquitetura Proposta

```text
+------------------+     +-------------------+     +----------------+
|   AddBalance     |     |   add-balance     |     |    Asaas       |
|   Dialog         | --> |   Edge Function   | --> |    API         |
+------------------+     +-------------------+     +----------------+
        |                                                   |
        | (exibe QR ou redireciona)                         |
        v                                                   v
+------------------+                              +------------------+
|   Usuario Paga   |                              |   Pagamento      |
|   PIX ou Cartao  |                              |   Confirmado     |
+------------------+                              +------------------+
                                                           |
+------------------+     +-------------------+             |
|   Saldo          | <-- | asaas-balance-    | <-----------+
|   Atualizado     |     | webhook           |  (webhook POST)
+------------------+     +-------------------+
```

---

## Etapas de Implementacao

### Fase 1: Configurar Secret do Asaas

Sera necessario obter sua chave de API do Asaas:
1. Acesse o painel do Asaas
2. Va em Configuracoes > Integracao > API
3. Copie sua API Key

A chave sera armazenada de forma segura no backend.

---

### Fase 2: Atualizar Edge Function `add-balance`

**Arquivo**: `supabase/functions/add-balance/index.ts`

Modificacoes:
- Substituir FastSoft por Asaas para geracao de PIX
- Adicionar suporte a cartao de credito via `invoiceUrl` do Asaas
- Usar API Key global da plataforma (nao do cliente)

```text
Fluxo PIX (billingType: PIX):
1. Criar cobranca no Asaas com billingType: 'PIX'
2. Buscar QR Code via endpoint /payments/{id}/pixQrCode
3. Retornar pixCode e pixQrcode para o frontend

Fluxo Cartao (billingType: CREDIT_CARD):
1. Criar cobranca no Asaas com billingType: 'CREDIT_CARD'
2. Retornar invoiceUrl para o frontend
3. Usuario eh redirecionado para pagina segura do Asaas
```

Endpoints Asaas utilizados:
- `POST /v3/payments` - Criar cobranca
- `GET /v3/payments/{id}/pixQrCode` - Obter QR Code PIX

---

### Fase 3: Criar Edge Function `asaas-balance-webhook`

**Novo arquivo**: `supabase/functions/asaas-balance-webhook/index.ts`

Responsabilidades:
- Receber notificacoes do Asaas (eventos de pagamento)
- Validar evento `PAYMENT_RECEIVED` ou `PAYMENT_CONFIRMED`
- Extrair client_id do campo `externalReference` ou `description`
- Creditar saldo usando funcao `addCreditToBalance` existente
- Registrar transacao com `payment_method: 'asaas_pix'` ou `'asaas_card'`

Eventos processados:
- `PAYMENT_RECEIVED` - Pagamento PIX confirmado
- `PAYMENT_CONFIRMED` - Pagamento cartao confirmado
- `PAYMENT_CREDIT_CARD_CAPTURE_REFUSED` - Cartao recusado (log)

---

### Fase 4: Configurar Webhook no Asaas

Apos deploy da edge function, a URL do webhook sera:
```
https://ufyvllgimtkyehfkfxoi.supabase.co/functions/v1/asaas-balance-webhook
```

Configurar no painel Asaas:
- URL: (acima)
- Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED

---

### Fase 5: Atualizar Frontend

**Arquivo**: `src/components/balance/AddBalanceDialog.tsx`

Modificacoes:
- Remover `disabled` da aba "Cartao"
- Implementar formulario para cartao
- Handler para redirecionar para `invoiceUrl` quando cartao

**Arquivo**: `src/hooks/useClientBalance.tsx`

Adicionar:
- Atualizar mutation para aceitar `method: 'pix' | 'card'`
- Tratar resposta com `invoiceUrl` para cartao

**Arquivo**: `src/pages/dashboard/BalancePage.tsx`

Adicionar:
- Deteccao de query params `?payment=success` ou `?payment=cancelled`
- Toast de confirmacao apos pagamento

---

### Fase 6: Configurar config.toml

**Arquivo**: `supabase/config.toml`

Adicionar:
```toml
[functions.asaas-balance-webhook]
verify_jwt = false
```

---

## API Asaas - Exemplos de Requisicao

**Criar cobranca PIX:**
```json
POST /v3/payments
{
  "customer": "cus_xxxxx",
  "billingType": "PIX",
  "value": 50.00,
  "dueDate": "2024-12-31",
  "description": "Recarga de Saldo - Plataforma",
  "externalReference": "client_id_aqui"
}
```

**Criar cobranca Cartao:**
```json
POST /v3/payments
{
  "customer": "cus_xxxxx",
  "billingType": "CREDIT_CARD",
  "value": 50.00,
  "dueDate": "2024-12-31",
  "description": "Recarga de Saldo - Plataforma",
  "externalReference": "client_id_aqui"
}
```

Resposta inclui `invoiceUrl` para redirecionar o usuario.

---

## Detalhes Tecnicos

**Estrutura da cobranca Asaas:**
- `customer` - ID do cliente no Asaas (criar se nao existir)
- `billingType` - PIX ou CREDIT_CARD
- `value` - Valor em reais (decimal)
- `dueDate` - Data de vencimento
- `externalReference` - client_id para identificar no webhook
- `description` - Descricao da cobranca

**Estrutura do webhook Asaas:**
```json
{
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_xxxxx",
    "value": 50.00,
    "billingType": "PIX",
    "status": "RECEIVED",
    "externalReference": "client_id_aqui"
  }
}
```

---

## Secret Necessaria

| Secret | Descricao | Como obter |
|--------|-----------|------------|
| ASAAS_API_KEY | Chave de API do Asaas | Painel Asaas > Integracao > API |

Ambiente sandbox: `https://sandbox.asaas.com/api`
Ambiente producao: `https://api.asaas.com`

---

## Fluxo do Usuario Final

**PIX:**
1. Clica em "Adicionar Saldo"
2. Seleciona aba PIX
3. Define valor e clica "Gerar PIX"
4. Visualiza QR Code e codigo copia/cola
5. Paga via app do banco
6. Webhook recebe confirmacao
7. Saldo atualizado automaticamente

**Cartao:**
1. Clica em "Adicionar Saldo"
2. Seleciona aba Cartao
3. Define valor e clica "Pagar com Cartao"
4. Redirecionado para pagina segura do Asaas
5. Insere dados do cartao
6. Apos pagamento, retorna ao app
7. Webhook recebe confirmacao
8. Saldo atualizado automaticamente

---

## Ordem de Implementacao

1. Solicitar ASAAS_API_KEY ao usuario
2. Atualizar `supabase/config.toml` com nova funcao
3. Implementar `asaas-balance-webhook` (nova edge function)
4. Atualizar `add-balance` para usar Asaas
5. Atualizar `AddBalanceDialog.tsx` com aba de cartao funcional
6. Atualizar `useClientBalance.tsx` com novo tipo de method
7. Adicionar tratamento de retorno na `BalancePage.tsx`
8. Testar fluxo PIX
9. Testar fluxo Cartao
10. Configurar webhook no painel Asaas
