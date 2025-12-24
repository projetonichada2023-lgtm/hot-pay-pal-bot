import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminFinancials } from "@/hooks/useAdminFinancials";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"];

export const AdminFinancialsPage = () => {
  const { data, isLoading } = useAdminFinancials();

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Métricas financeiras avançadas</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px]" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px]" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const metricsCards = [
    {
      title: "MRR (Receita Mensal)",
      value: formatPrice(data?.mrr || 0),
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Taxa de Churn",
      value: `${(data?.churn || 0).toFixed(1)}%`,
      icon: data?.churn && data.churn > 5 ? TrendingDown : TrendingUp,
      color: data?.churn && data.churn > 5 ? "text-red-500" : "text-green-500",
      bgColor: data?.churn && data.churn > 5 ? "bg-red-500/10" : "bg-green-500/10",
      subtitle: data?.churn && data.churn > 5 ? "Alto" : "Saudável",
    },
    {
      title: "LTV Médio",
      value: formatPrice(data?.ltv || 0),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      subtitle: "Valor por cliente",
    },
    {
      title: "Crescimento",
      value: `${(data?.growthRate || 0).toFixed(1)}%`,
      icon: data?.growthRate && data.growthRate >= 0 ? ArrowUpRight : ArrowDownRight,
      color: data?.growthRate && data.growthRate >= 0 ? "text-green-500" : "text-red-500",
      bgColor: data?.growthRate && data.growthRate >= 0 ? "bg-green-500/10" : "bg-red-500/10",
      subtitle: "vs mês anterior",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">Métricas financeiras avançadas</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value: number) => [formatPrice(value), "Receita"]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders per Month */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: number) => [value, "Pedidos"]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.revenueByStatus?.filter((s) => s.value > 0) || []}
                  dataKey="value"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data?.revenueByStatus?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatPrice(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Receita Total (6 meses)</span>
              <span className="font-bold text-lg">
                {formatPrice(
                  data?.monthlyRevenue?.reduce((sum, m) => sum + m.revenue, 0) || 0
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Pedidos Total (6 meses)</span>
              <span className="font-bold text-lg">
                {data?.monthlyRevenue?.reduce((sum, m) => sum + m.orders, 0) || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Ticket Médio</span>
              <span className="font-bold text-lg">
                {formatPrice(
                  (data?.monthlyRevenue?.reduce((sum, m) => sum + m.revenue, 0) || 0) /
                    Math.max(data?.monthlyRevenue?.reduce((sum, m) => sum + m.orders, 0) || 1, 1)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Projeção Anual (baseado em MRR)</span>
              <span className="font-bold text-lg text-emerald-500">
                {formatPrice((data?.mrr || 0) * 12)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
