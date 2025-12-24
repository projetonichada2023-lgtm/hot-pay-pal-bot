import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, ShoppingCart, DollarSign, CreditCard, TrendingUp, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useAdminStats();

  const statsCards = [
    {
      title: "Total de Clientes",
      value: stats?.totalClients || 0,
      icon: Users,
      description: `${stats?.activeClients || 0} ativos`,
      color: "text-blue-500",
    },
    {
      title: "Novos Este Mês",
      value: stats?.newClientsThisMonth || 0,
      icon: UserPlus,
      description: "Clientes cadastrados",
      color: "text-green-500",
    },
    {
      title: "Total de Pedidos",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: "Em toda plataforma",
      color: "text-purple-500",
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Pedidos pagos",
      color: "text-emerald-500",
    },
    {
      title: "Assinaturas Ativas",
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      description: "Planos ativos",
      color: "text-orange-500",
    },
    {
      title: "Em Trial",
      value: stats?.trialSubscriptions || 0,
      icon: TrendingUp,
      description: "Período de teste",
      color: "text-cyan-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
