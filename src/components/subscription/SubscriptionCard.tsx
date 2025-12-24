import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Crown, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Zap, 
  Shield,
  ArrowUp,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscriptionCardProps {
  currentProductsCount: number;
  currentOrdersThisMonth: number;
  currentRecoveryMessagesCount: number;
}

export const SubscriptionCard = ({
  currentProductsCount,
  currentOrdersThisMonth,
  currentRecoveryMessagesCount,
}: SubscriptionCardProps) => {
  const { subscription, planLimits, isLoading, planType, isActive } = useSubscription();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const planNames: Record<string, string> = {
    free: "Gratuito",
    basic: "Básico",
    pro: "Profissional",
    enterprise: "Enterprise",
  };

  const planColors: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    basic: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    pro: "bg-primary/10 text-primary border-primary/20",
    enterprise: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-500",
    trial: "bg-blue-500/10 text-blue-500",
    expired: "bg-red-500/10 text-red-500",
    cancelled: "bg-gray-500/10 text-gray-500",
    pending: "bg-yellow-500/10 text-yellow-500",
  };

  const statusNames: Record<string, string> = {
    active: "Ativo",
    trial: "Trial",
    expired: "Expirado",
    cancelled: "Cancelado",
    pending: "Pendente",
  };

  const getProgress = (current: number, max: number) => {
    if (max === -1) return 10; // Unlimited - show low progress
    return Math.min((current / max) * 100, 100);
  };

  const getProgressColor = (current: number, max: number) => {
    if (max === -1) return "bg-primary";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const formatLimit = (value: number) => {
    return value === -1 ? "Ilimitado" : value.toString();
  };

  const maxProducts = planLimits?.max_products || 5;
  const maxOrders = planLimits?.max_orders_per_month || 50;
  const maxRecovery = planLimits?.max_recovery_messages || 1;

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Meu Plano
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura e veja seus limites
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={planColors[planType]} variant="outline">
              {planNames[planType]}
            </Badge>
            {subscription && (
              <Badge className={statusColors[subscription.status]}>
                {statusNames[subscription.status]}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expiration Info */}
        {subscription?.expires_at && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <span className="text-muted-foreground">Expira em: </span>
            <span className="font-medium">
              {format(new Date(subscription.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Usage Limits */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Uso do Plano
          </h4>

          {/* Products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>Produtos</span>
              </div>
              <span className="font-medium">
                {currentProductsCount} / {formatLimit(maxProducts)}
              </span>
            </div>
            <Progress 
              value={getProgress(currentProductsCount, maxProducts)} 
              className="h-2"
            />
          </div>

          {/* Orders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                <span>Pedidos este mês</span>
              </div>
              <span className="font-medium">
                {currentOrdersThisMonth} / {formatLimit(maxOrders)}
              </span>
            </div>
            <Progress 
              value={getProgress(currentOrdersThisMonth, maxOrders)} 
              className="h-2"
            />
          </div>

          {/* Recovery Messages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span>Mensagens de Recuperação</span>
              </div>
              <span className="font-medium">
                {currentRecoveryMessagesCount} / {formatLimit(maxRecovery)}
              </span>
            </div>
            <Progress 
              value={getProgress(currentRecoveryMessagesCount, maxRecovery)} 
              className="h-2"
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Recursos do Plano
          </h4>
          <div className="grid gap-2">
            <FeatureRow 
              icon={<Zap className="w-4 h-4" />}
              label="Upsell de Produtos"
              enabled={planLimits?.upsell_enabled || false}
            />
            <FeatureRow 
              icon={<MessageSquare className="w-4 h-4" />}
              label="Recuperação de Carrinho"
              enabled={planLimits?.cart_recovery_enabled || false}
            />
            <FeatureRow 
              icon={<Shield className="w-4 h-4" />}
              label="Mensagens Personalizadas"
              enabled={planLimits?.custom_messages_enabled || false}
            />
            <FeatureRow 
              icon={<Crown className="w-4 h-4" />}
              label="Suporte Prioritário"
              enabled={planLimits?.priority_support || false}
            />
          </div>
        </div>

        {/* Upgrade Button */}
        {planType !== "enterprise" && (
          <Button className="w-full" variant="default">
            <ArrowUp className="w-4 h-4 mr-2" />
            Fazer Upgrade
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const FeatureRow = ({ 
  icon, 
  label, 
  enabled 
}: { 
  icon: React.ReactNode; 
  label: string; 
  enabled: boolean;
}) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span>{label}</span>
    </div>
    {enabled ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-muted-foreground" />
    )}
  </div>
);
