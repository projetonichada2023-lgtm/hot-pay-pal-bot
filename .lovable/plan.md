

# Correção das Políticas RLS Permissivas

## Resumo

Identificamos **9 políticas RLS** com expressões permissivas (`USING (true)` ou `WITH CHECK (true)`) que representam riscos de segurança. Além disso, há uma vulnerabilidade crítica onde tokens do Telegram ficam expostos.

---

## Problemas Identificados

### Vulnerabilidade Crítica

| Tabela | Problema |
|--------|----------|
| `client_bots` | Tokens do Telegram expostos. A política "Service role can manage bots" usa `USING(true)` permitindo acesso irrestrito |

### Políticas Permissivas (Risco Médio)

| Tabela | Política | Tipo | Problema |
|--------|----------|------|----------|
| `affiliate_commissions` | Service role can insert commissions | INSERT | `WITH CHECK (true)` |
| `client_bots` | Service role can manage bots | ALL | `USING (true)` + `WITH CHECK (true)` |
| `facebook_events` | Service role can insert Facebook events | INSERT | `WITH CHECK (true)` |
| `tiktok_events` | Service role can insert TikTok events | INSERT | `WITH CHECK (true)` |
| `ttclid_mappings` | Service role can insert/select/update mappings | ALL | `USING (true)` |
| `notification_templates` | Service role can read notification templates | SELECT | `USING (true)` |

### Política Aceitável (Não será alterada)

| Tabela | Política | Justificativa |
|--------|----------|---------------|
| `plan_limits` | Anyone can view plan limits | Dados públicos de planos/preços - intencional |

---

## Solução

### Estratégia

As Edge Functions já utilizam `SUPABASE_SERVICE_ROLE_KEY` que **bypassa RLS automaticamente**. Portanto, as políticas "Service role can..." são **desnecessárias** e representam brechas de segurança.

A correção envolve:
1. **Remover** políticas permissivas desnecessárias
2. **Criar view** para esconder tokens sensíveis da tabela `client_bots`
3. **Restringir** acesso a dados sensíveis apenas para proprietários

---

## Alterações no Banco de Dados

### 1. Tabela `client_bots` (Crítico)

```text
┌─────────────────────────────────────────────────────────┐
│                     ANTES                               │
├─────────────────────────────────────────────────────────┤
│ Política "Service role can manage bots"                 │
│ → USING(true) + WITH CHECK(true)                        │
│ → Qualquer usuário pode ver tokens do Telegram!         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                     DEPOIS                              │
├─────────────────────────────────────────────────────────┤
│ 1. Remover política "Service role can manage bots"      │
│ 2. Criar VIEW client_bots_public (sem tokens)           │
│ 3. Atualizar código para usar a view                    │
└─────────────────────────────────────────────────────────┘
```

**SQL:**
```sql
-- Remover política permissiva
DROP POLICY IF EXISTS "Service role can manage bots" ON public.client_bots;

-- Criar view pública que esconde tokens sensíveis
CREATE VIEW public.client_bots_public
WITH (security_invoker = on) AS
SELECT 
  id,
  client_id,
  name,
  telegram_bot_username,
  webhook_configured,
  is_active,
  is_primary,
  created_at,
  updated_at
FROM public.client_bots;
-- Exclui: telegram_bot_token
```

### 2. Tabela `affiliate_commissions`

```sql
-- Remover política permissiva (service role já bypassa RLS)
DROP POLICY IF EXISTS "Service role can insert commissions" 
ON public.affiliate_commissions;
```

### 3. Tabela `facebook_events`

```sql
-- Remover política permissiva
DROP POLICY IF EXISTS "Service role can insert Facebook events" 
ON public.facebook_events;
```

### 4. Tabela `tiktok_events`

```sql
-- Remover política permissiva
DROP POLICY IF EXISTS "Service role can insert TikTok events" 
ON public.tiktok_events;
```

### 5. Tabela `ttclid_mappings`

```sql
-- Remover políticas permissivas
DROP POLICY IF EXISTS "Service role can insert mappings" 
ON public.ttclid_mappings;

DROP POLICY IF EXISTS "Service role can select mappings" 
ON public.ttclid_mappings;

DROP POLICY IF EXISTS "Service role can update mappings" 
ON public.ttclid_mappings;
```

### 6. Tabela `notification_templates`

```sql
-- Remover política permissiva
DROP POLICY IF EXISTS "Service role can read notification templates" 
ON public.notification_templates;

-- Adicionar política restritiva (apenas admins e usuários autenticados)
CREATE POLICY "Authenticated users can read notification templates"
ON public.notification_templates
FOR SELECT
TO authenticated
USING (true);
```

---

## Alterações no Código

### Hook `useClientBots.tsx`

Modificar para usar a view `client_bots_public` nas queries de leitura, mantendo operações de escrita diretas na tabela (protegidas por RLS).

```typescript
// Queries de leitura usarão a view (sem tokens expostos)
const { data } = await supabase
  .from('client_bots_public')  // ← View sem tokens
  .select('*')
  .eq('client_id', clientId);

// Operações de escrita continuam na tabela original
// (protegidas por políticas RLS existentes)
```

---

## Impacto

### Funcionalidades Preservadas

| Componente | Status |
|------------|--------|
| Edge Functions (telegram-webhook, cart-recovery, etc.) | Sem impacto - usam service role |
| Dashboard de clientes | Sem impacto - usam políticas existentes |
| Painel admin | Sem impacto - usa `has_role()` |
| Push notifications | Sem impacto |

### Segurança Melhorada

| Antes | Depois |
|-------|--------|
| Tokens Telegram expostos | Protegidos em view |
| 9 políticas permissivas | 2 políticas (plan_limits e notification_templates para autenticados) |
| Risco de vazamento de dados | Acesso restrito por proprietário |

---

## Seção Técnica

### Por que remover políticas "Service role"?

O `service_role` do Supabase **já bypassa RLS por design**. Criar políticas `USING(true)` para "service role" é redundante e perigoso porque:

1. **RLS é para `anon` e `authenticated`**: O service role nunca é avaliado por RLS
2. **Cria brechas**: Políticas `USING(true)` se aplicam a todos os roles, não apenas service role
3. **Prática incorreta**: O nome da política sugere restrição, mas `true` libera para todos

### Fluxo de Dados Após Correção

```text
┌──────────────────────────────────────────────────────────────┐
│                    FLUXO DE ACESSO                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Dashboard)                                        │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────┐                                         │
│  │ Supabase Client │ ──→ client_bots_public (view)           │
│  │   (anon key)    │     └─ Sem telegram_bot_token           │
│  └─────────────────┘                                         │
│                                                              │
│  Edge Functions (Backend)                                    │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────┐                                         │
│  │ Service Role    │ ──→ client_bots (tabela completa)       │
│  │   (bypassa RLS) │     └─ Acesso a telegram_bot_token      │
│  └─────────────────┘                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Resumo das Tarefas

1. Criar migração SQL para remover 8 políticas permissivas
2. Criar view `client_bots_public` sem tokens sensíveis
3. Adicionar política para `notification_templates` (authenticated)
4. Atualizar hook `useClientBots.tsx` para usar view
5. Testar funcionalidades após mudanças

