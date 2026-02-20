

# Separar o Dashboard de Afiliados Completamente

## Problema Atual
O `AffiliateDashboard` importa e usa componentes do dashboard principal de clientes:
- `Sidebar` do dashboard de clientes (aparece quando o usuario tambem e cliente)
- `useClient` para buscar dados de cliente
- `BotProvider` para contexto de bots

Isso mistura as duas areas e gera dependencias desnecessarias.

## O Que Sera Feito

### 1. Criar header/sidebar proprio para afiliados
Criar um componente `AffiliateHeader` ou `AffiliateSidebar` simples e exclusivo, com:
- Logo Conversy
- Nome do afiliado
- Navegacao entre as abas (Visao Geral, Links, Subs, Comissoes, Config)
- Botao de sair

### 2. Remover dependencias do dashboard de clientes
No `AffiliateDashboard.tsx`:
- Remover import do `Sidebar` do dashboard
- Remover `useClient` 
- Remover `BotProvider`
- Usar o novo `AffiliateHeader`/layout proprio
- Layout independente sem condicoes baseadas em `client`

### 3. Layout final do Affiliate Dashboard
```text
+----------------------------------+
| [Logo]  Painel Afiliados  [Sair] |   <-- AffiliateHeader
+----------------------------------+
| [Visao Geral] [Links] [Subs]    |
| [Comissoes] [Config]            |   <-- Tabs (ja existem)
+----------------------------------+
| Conteudo da aba ativa            |
+----------------------------------+
```

## Detalhes Tecnicos

### Arquivos
- **Criar**: `src/components/affiliate/AffiliateHeader.tsx` -- header com logo, nome do afiliado e botao de logout
- **Editar**: `src/pages/affiliate/AffiliateDashboard.tsx` -- remover Sidebar, useClient, BotProvider; usar AffiliateHeader; layout 100% independente

### O que NAO muda
- Os componentes internos das abas (AffiliateOverview, AffiliateLinks, etc.) permanecem iguais
- AffiliateRegister e AffiliatePending ja sao independentes
- AffiliateAuth ja esta separado
- useAffiliate e useAuth continuam sendo usados normalmente

