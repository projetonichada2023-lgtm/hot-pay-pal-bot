import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  MessageSquare, 
  Package, 
  ShoppingCart,
  Shield,
  Star,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Client } from "@/hooks/useClient";

interface UpgradePageProps {
  client: Client;
}

interface PlanFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    description: "Para começar a vender",
    popular: false,
    color: "border-muted",
  },
  {
    id: "basic",
    name: "Básico",
    price: 49.90,
    description: "Para pequenos negócios",
    popular: false,
    color: "border-blue-500",
  },
  {
    id: "pro",
    name: "Profissional",
    price: 99.90,
    description: "Para escalar suas vendas",
    popular: true,
    color: "border-primary",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    description: "Solução personalizada",
    popular: false,
    color: "border-amber-500",
  },
];

const features: PlanFeature[] = [
  { name: "Produtos", free: "5", basic: "20", pro: "100", enterprise: "Ilimitado" },
  { name: "Pedidos/mês", free: "50", basic: "200", pro: "1.000", enterprise: "Ilimitado" },
  { name: "Mensagens de recuperação", free: "1", basic: "3", pro: "5", enterprise: "Ilimitado" },
  { name: "Upsell de produtos", free: true, basic: true, pro: true, enterprise: true },
  { name: "Recuperação de carrinho", free: true, basic: false, pro: true, enterprise: true },
  { name: "Mensagens personalizadas", free: false, basic: true, pro: true, enterprise: true },
  { name: "Suporte prioritário", free: false, basic: false, pro: false, enterprise: true },
  { name: "API de integração", free: false, basic: false, pro: true, enterprise: true },
  { name: "Relatórios avançados", free: false, basic: true, pro: true, enterprise: true },
  { name: "Múltiplos bots", free: false, basic: false, pro: false, enterprise: true },
];

export const UpgradePage = ({ client }: UpgradePageProps) => {
  const { subscription, isLoading, planType } = useSubscription();
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    if (planId === "enterprise") {
      window.open("https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Enterprise.", "_blank");
    } else {
      window.open(`https://wa.me/5511999999999?text=Olá! Quero fazer upgrade para o plano ${planId}.`, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2" 
            onClick={() => navigate("/dashboard/settings")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            Escolha seu Plano
          </h1>
          <p className="text-muted-foreground mt-1">
            Desbloqueie todo o potencial do seu bot de vendas
          </p>
        </div>
        {subscription && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            Plano atual: <span className="font-bold ml-1 capitalize">{planType}</span>
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = planType === plan.id;
          const isUpgrade = 
            (planType === "free" && plan.id !== "free") ||
            (planType === "basic" && (plan.id === "pro" || plan.id === "enterprise")) ||
            (planType === "pro" && plan.id === "enterprise");

          return (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${plan.color} ${
                plan.popular ? "border-2 shadow-lg scale-[1.02]" : "border"
              } ${isCurrentPlan ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </div>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute top-0 left-0">
                  <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                    Plano Atual
                  </div>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  {plan.price !== null ? (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-4xl font-bold">{plan.price.toFixed(2).replace(".", ",")}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">
                      Sob consulta
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Features */}
                <div className="space-y-2">
                  <FeatureItem 
                    icon={Package} 
                    text={`${features[0][plan.id as keyof PlanFeature]} produtos`}
                  />
                  <FeatureItem 
                    icon={ShoppingCart} 
                    text={`${features[1][plan.id as keyof PlanFeature]} pedidos/mês`}
                  />
                  <FeatureItem 
                    icon={MessageSquare} 
                    text={`${features[2][plan.id as keyof PlanFeature]} msg recuperação`}
                  />
                  <FeatureItem 
                    icon={Zap} 
                    text="Upsell de produtos"
                    enabled={features[3][plan.id as keyof PlanFeature] === true}
                  />
                  <FeatureItem 
                    icon={Shield} 
                    text="Suporte prioritário"
                    enabled={features[6][plan.id as keyof PlanFeature] === true}
                  />
                </div>

                <Button 
                  className="w-full mt-4"
                  variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "secondary"}
                  disabled={isCurrentPlan}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan ? (
                    "Plano Atual"
                  ) : isUpgrade ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Fazer Upgrade
                    </>
                  ) : (
                    "Selecionar"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Comparação Completa de Recursos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Recurso</th>
                  {plans.map((plan) => (
                    <th 
                      key={plan.id} 
                      className={`text-center p-4 font-medium ${planType === plan.id ? "bg-primary/10" : ""}`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.name} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                    <td className="p-4 font-medium">{feature.name}</td>
                    {(["free", "basic", "pro", "enterprise"] as const).map((planId) => (
                      <td 
                        key={planId} 
                        className={`text-center p-4 ${planType === planId ? "bg-primary/10" : ""}`}
                      >
                        {typeof feature[planId] === "boolean" ? (
                          feature[planId] ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                          )
                        ) : (
                          <span className="font-medium">{feature[planId]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <h3 className="text-xl font-bold mb-2">Precisa de ajuda para escolher?</h3>
          <p className="text-muted-foreground mb-4">
            Nossa equipe está pronta para ajudar você a encontrar o plano ideal para o seu negócio.
          </p>
          <Button 
            size="lg"
            onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Preciso de ajuda para escolher um plano.", "_blank")}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Falar com um Especialista
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const FeatureItem = ({ 
  icon: Icon, 
  text, 
  enabled = true 
}: { 
  icon: React.ElementType; 
  text: string; 
  enabled?: boolean;
}) => (
  <div className={`flex items-center gap-2 text-sm ${enabled ? "" : "text-muted-foreground/60"}`}>
    <Icon className={`w-4 h-4 ${enabled ? "text-primary" : "text-muted-foreground/40"}`} />
    <span>{text}</span>
  </div>
);
