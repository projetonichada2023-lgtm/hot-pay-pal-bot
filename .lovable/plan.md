
# Divisao de Comissao entre Afiliado e Subafiliado

## Resumo
O afiliado pai podera definir quanto da sua comissao deseja compartilhar com cada subafiliado. Por exemplo, se o afiliado tem 10% de comissao, ele pode escolher dar 3% ao subafiliado e ficar com 7%.

## Alteracoes no Banco de Dados

Adicionar coluna `sub_commission_rate` na tabela `affiliates` para que cada afiliado defina a porcentagem que repassa aos seus subafiliados:

```text
ALTER TABLE affiliates 
  ADD COLUMN parent_affiliate_id uuid REFERENCES affiliates(id),
  ADD COLUMN sub_commission_rate numeric NOT NULL DEFAULT 2;
```

- `parent_affiliate_id`: referencia ao afiliado que indicou (null para afiliados raiz)
- `sub_commission_rate`: porcentagem que o afiliado pai repassa ao subafiliado (padrao 2%)

Adicionar colunas em `affiliate_commissions` para rastrear a origem:

```text
ALTER TABLE affiliate_commissions
  ADD COLUMN source text NOT NULL DEFAULT 'direct',
  ADD COLUMN sub_affiliate_id uuid REFERENCES affiliates(id);
```

Adicionar politica RLS para afiliados verem seus subafiliados:

```text
CREATE POLICY "Affiliates can view their sub-affiliates"
  ON affiliates FOR SELECT
  USING (parent_affiliate_id = get_my_affiliate_id());
```

## Alteracoes no Frontend

### 1. Configuracoes do Afiliado (`AffiliateSettings.tsx`)
- Adicionar campo "Taxa para Subafiliados" com um slider ou input numerico
- Validacao: o valor deve ser entre 0 e a `commission_rate` do afiliado (ex: 0-10%)
- Exibir texto explicativo: "Voce recebe X% e seu subafiliado recebe Y%"
- Atualizar o formulario para enviar `sub_commission_rate` junto com os demais dados

### 2. Hook `useAffiliate.tsx`
- Adicionar query para buscar subafiliados (onde `parent_affiliate_id = meu_id`)
- Incluir `sub_commission_rate` no tipo `Affiliate`
- Calcular ganhos indiretos separadamente nas stats

### 3. Nova aba "Subafiliados" no Dashboard (`AffiliateDashboard.tsx`)
- Adicionar tab "Subafiliados" com icone `Users`
- Novo componente `AffiliateSubAffiliates.tsx`:
  - Tabela com subafiliados (nome, status, ganhos, data)
  - Link de convite para copiar (`https://conversyapp.com/affiliate?ref=CODIGO`)
  - Cards com metricas: total subafiliados, ganhos indiretos

### 4. Registro (`AffiliateRegister.tsx`)
- Detectar parametro `?ref=CODIGO` na URL
- Buscar o afiliado pelo codigo e salvar `parent_affiliate_id` no cadastro

### 5. Overview (`AffiliateOverview.tsx`)
- Adicionar card "Ganhos de Subafiliados" mostrando comissoes indiretas

## Fluxo de Comissao

```text
Exemplo: Afiliado A tem 10% e definiu sub_commission_rate = 3%

1. Subafiliado B gera uma venda de R$ 100
2. Comissao total: R$ 10 (10%)
3. Subafiliado B recebe: R$ 3 (sub_commission_rate definida pelo pai)
4. Afiliado A recebe: R$ 7 (10% - 3% = diferenca)
```

- A soma nunca ultrapassa a `commission_rate` original
- O afiliado pai controla quanto compartilha via configuracoes
