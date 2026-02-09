
# Plano: Melhorar Sidebar e Area Financeira

## Resumo

Redesign da sidebar com agrupamento visual por categorias e upgrade completo da pagina Financeiro com graficos de evolucao, faturas diarias e visual premium alinhado com a estetica da plataforma.

---

## 1. Sidebar - Agrupamento por Categorias

A sidebar atual lista 14 itens sem separacao visual. Vamos organizar em grupos logicos com labels sutis:

```text
+-----------------------------+
|  [Logo Conversy]            |
|  [Bot Selector]             |
|                             |
|  PRINCIPAL                  |
|    Dashboard                |
|    Conversas                |
|                             |
|  VENDAS                     |
|    Mensagens Bot            |
|    Produtos                 |
|    Funil                    |
|    Pedidos                  |
|    Recuperacao              |
|                             |
|  ANALISE                    |
|    Clientes                 |
|    Tracking                 |
|    Relatorios               |
|                             |
|  GESTAO                     |
|    Financeiro               |
|    Meus Bots                |
|    Simulador                |
|    Configuracoes            |
|                             |
|  [Theme] [Sair]             |
+-----------------------------+
```

**Detalhes visuais:**
- Labels de grupo em texto uppercase, tamanho xs, cor muted, tracking wider
- Espacamento sutil entre grupos (separador invisivel)
- Labels ocultos quando sidebar esta colapsada
- Indicador de divida no item "Financeiro" (badge vermelho com valor) quando houver debt_amount > 0

---

## 2. Sidebar - Badge de Divida no Financeiro

Adicionar um badge vermelho ao lado do item "Financeiro" na sidebar que mostra o valor da divida pendente, incentivando o usuario a regularizar. Usa o hook `useClientBalance` ja existente.

---

## 3. Pagina Financeiro (BalancePage) - Redesign Premium

### 3.1 Header Melhorado
- Titulo com tipografia Clash Display
- Subtitulo contextual baseado no estado (divida, bloqueio, tudo ok)
- Remover emoji do titulo, usar icone Wallet inline

### 3.2 Cards de Metricas Redesign
Transformar os 3 cards atuais em 4 cards com visual glassmorphism:
- **Saldo Disponivel** - Verde, icone Wallet
- **Taxas Hoje** - Azul, icone Receipt
- **Taxas do Mes** - Laranja (primary), icone Calendar
- **Divida Pendente** - Vermelho/verde condicional

Estilo: fundo com gradiente sutil, borda hairline, desfoque

### 3.3 Grafico de Evolucao de Saldo
Novo componente com AreaChart (Recharts) mostrando:
- Evolucao do saldo nos ultimos 30 dias baseado em balance_transactions
- Linha de creditos vs debitos
- Tooltip formatado em BRL

### 3.4 Lista de Faturas Diarias
Nova secao mostrando as `daily_fee_invoices` (hook `useDailyInvoices` ja existe):
- Data, total de taxas, quantidade de vendas, status (pago/pendente)
- Badge de status colorido
- Layout em tabela responsiva

### 3.5 Transacoes Recentes - Visual Melhorado
- Icones diferenciados por tipo (credito, taxa, pagamento divida)
- Badge de metodo de pagamento (PIX, Cartao, Saldo)
- Animacao sutil de entrada com framer-motion

---

## Detalhes Tecnicos

### Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/dashboard/Sidebar.tsx` | Reorganizar menuItems em grupos, adicionar labels de categoria, badge de divida |
| `src/pages/dashboard/BalancePage.tsx` | Redesign completo com graficos, faturas, visual premium |
| `src/components/balance/BalanceChart.tsx` | **Novo** - Grafico de evolucao de saldo (AreaChart) |
| `src/components/balance/DailyInvoicesTable.tsx` | **Novo** - Tabela de faturas diarias |

### Dependencias
- Recharts (ja instalado) para graficos
- Framer Motion (ja instalado) para animacoes
- Hooks existentes: `useClientBalance`, `useBalanceTransactions`, `useDailyInvoices`, `useMonthlyFeeStats`, `useTodayFees`

### Sidebar - Estrutura de Grupos

```typescript
const menuGroups = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: MessageCircle, label: 'Conversas', path: '/dashboard/chats' },
    ]
  },
  {
    label: 'Vendas',
    items: [
      { icon: MessageSquare, label: 'Mensagens Bot', path: '/dashboard/messages' },
      { icon: Package, label: 'Produtos', path: '/dashboard/products' },
      { icon: GitBranch, label: 'Funil', path: '/dashboard/funnel' },
      { icon: ShoppingCart, label: 'Pedidos', path: '/dashboard/orders' },
      { icon: RefreshCw, label: 'Recuperação', path: '/dashboard/recovery' },
    ]
  },
  {
    label: 'Análise',
    items: [
      { icon: Users, label: 'Clientes', path: '/dashboard/customers' },
      { icon: Target, label: 'Tracking', path: '/dashboard/tracking' },
      { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports' },
    ]
  },
  {
    label: 'Gestão',
    items: [
      { icon: Wallet, label: 'Financeiro', path: '/dashboard/balance' },
      { icon: Boxes, label: 'Meus Bots', path: '/dashboard/bots' },
      { icon: Smartphone, label: 'Simulador', path: '/dashboard/simulator' },
      { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
    ]
  },
];
```

### Grafico de Saldo - Logica

O componente `BalanceChart` recebera as `balance_transactions` e calculara o saldo acumulado dia a dia para plotar no AreaChart. Agrupamento por dia, com fallback para os ultimos 30 dias.

### Faturas Diarias - Componente

Tabela simples com colunas: Data | Vendas | Total Taxas | Status, usando os dados de `useDailyInvoices`. Status renderizado como Badge colorido (verde=pago, amarelo=pendente, vermelho=vencido).

---

## Ordem de Implementacao

1. Reorganizar sidebar com grupos e labels
2. Adicionar badge de divida ao item Financeiro
3. Criar componente `BalanceChart`
4. Criar componente `DailyInvoicesTable`
5. Redesign da `BalancePage` com novo layout premium
6. Testar responsividade mobile
