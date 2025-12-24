import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePlanLimits,
  useUpdatePlanLimit,
  useAdminSettings,
  useUpdateAdminSetting,
} from "@/hooks/useAdminSettings";
import {
  Settings,
  Package,
  ShoppingCart,
  MessageSquare,
  Zap,
  RefreshCw,
  Crown,
  Headphones,
  Save,
  Check,
  X,
} from "lucide-react";

const planLabels: Record<string, { label: string; color: string }> = {
  free: { label: "Gratuito", color: "bg-gray-500/10 text-gray-500" },
  basic: { label: "Básico", color: "bg-blue-500/10 text-blue-500" },
  pro: { label: "Pro", color: "bg-purple-500/10 text-purple-500" },
  enterprise: { label: "Enterprise", color: "bg-amber-500/10 text-amber-500" },
};

export const AdminSettingsPage = () => {
  const { data: planLimits, isLoading: limitsLoading } = usePlanLimits();
  const { data: settings, isLoading: settingsLoading } = useAdminSettings();
  const updatePlanLimit = useUpdatePlanLimit();
  const updateSetting = useUpdateAdminSetting();

  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number | boolean>>({});

  const handleEditPlan = (plan: NonNullable<typeof planLimits>[0]) => {
    setEditingPlan(plan.id);
    setEditValues({
      max_products: plan.max_products,
      max_orders_per_month: plan.max_orders_per_month,
      max_recovery_messages: plan.max_recovery_messages,
      upsell_enabled: plan.upsell_enabled,
      cart_recovery_enabled: plan.cart_recovery_enabled,
      custom_messages_enabled: plan.custom_messages_enabled,
      priority_support: plan.priority_support,
    });
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    await updatePlanLimit.mutateAsync({
      id: editingPlan,
      ...editValues,
    } as Parameters<typeof updatePlanLimit.mutateAsync>[0]);
    setEditingPlan(null);
    setEditValues({});
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setEditValues({});
  };

  const getSettingValue = (key: string) => {
    return settings?.find((s) => s.setting_key === key)?.setting_value || "";
  };

  const handleSettingChange = async (key: string, value: string) => {
    await updateSetting.mutateAsync({ key, value });
  };

  if (limitsLoading || settingsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Configurações globais da plataforma</p>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-[200px]" />
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
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configurações globais da plataforma</p>
      </div>

      <Tabs defaultValue="limits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="limits" className="gap-2">
            <Crown className="h-4 w-4" />
            Limites por Plano
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações Gerais
          </TabsTrigger>
        </TabsList>

        {/* Plan Limits Tab */}
        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Limites por Plano
              </CardTitle>
              <CardDescription>
                Configure os limites e funcionalidades disponíveis em cada plano. Use -1 para
                ilimitado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plano</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="h-4 w-4" />
                        Produtos
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        Pedidos/mês
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Msgs Recovery
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="h-4 w-4" />
                        Upsell
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <RefreshCw className="h-4 w-4" />
                        Recovery
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Custom Msgs
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Headphones className="h-4 w-4" />
                        Suporte VIP
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planLimits?.map((plan) => {
                    const isEditing = editingPlan === plan.id;
                    return (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <Badge className={planLabels[plan.plan_type]?.color}>
                            {planLabels[plan.plan_type]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues.max_products as number}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  max_products: parseInt(e.target.value),
                                })
                              }
                              className="w-20 mx-auto text-center"
                            />
                          ) : (
                            <span>{plan.max_products === -1 ? "∞" : plan.max_products}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues.max_orders_per_month as number}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  max_orders_per_month: parseInt(e.target.value),
                                })
                              }
                              className="w-20 mx-auto text-center"
                            />
                          ) : (
                            <span>
                              {plan.max_orders_per_month === -1 ? "∞" : plan.max_orders_per_month}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues.max_recovery_messages as number}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  max_recovery_messages: parseInt(e.target.value),
                                })
                              }
                              className="w-20 mx-auto text-center"
                            />
                          ) : (
                            <span>
                              {plan.max_recovery_messages === -1 ? "∞" : plan.max_recovery_messages}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Switch
                              checked={editValues.upsell_enabled as boolean}
                              onCheckedChange={(checked) =>
                                setEditValues({ ...editValues, upsell_enabled: checked })
                              }
                            />
                          ) : plan.upsell_enabled ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Switch
                              checked={editValues.cart_recovery_enabled as boolean}
                              onCheckedChange={(checked) =>
                                setEditValues({ ...editValues, cart_recovery_enabled: checked })
                              }
                            />
                          ) : plan.cart_recovery_enabled ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Switch
                              checked={editValues.custom_messages_enabled as boolean}
                              onCheckedChange={(checked) =>
                                setEditValues({ ...editValues, custom_messages_enabled: checked })
                              }
                            />
                          ) : plan.custom_messages_enabled ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Switch
                              checked={editValues.priority_support as boolean}
                              onCheckedChange={(checked) =>
                                setEditValues({ ...editValues, priority_support: checked })
                              }
                            />
                          ) : plan.priority_support ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                onClick={handleSavePlan}
                                disabled={updatePlanLimit.isPending}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPlan(plan)}
                            >
                              Editar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>Configurações globais da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="trial_days">Dias de Trial</Label>
                  <Input
                    id="trial_days"
                    type="number"
                    value={getSettingValue("trial_days")}
                    onChange={(e) => handleSettingChange("trial_days", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Número de dias do período de teste para novos clientes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order_value">Valor Mínimo de Pedido (R$)</Label>
                  <Input
                    id="min_order_value"
                    type="number"
                    value={getSettingValue("min_order_value")}
                    onChange={(e) => handleSettingChange("min_order_value", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor mínimo para criar um pedido (0 = sem mínimo)
                  </p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium">Notificações Admin</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificar Novos Clientes</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber notificação quando um novo cliente se cadastrar
                      </p>
                    </div>
                    <Switch
                      checked={getSettingValue("notify_new_client") === "true"}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notify_new_client", checked.toString())
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificar Trials Expirando</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber notificação sobre períodos de teste expirando
                      </p>
                    </div>
                    <Switch
                      checked={getSettingValue("notify_expiring_trial") === "true"}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notify_expiring_trial", checked.toString())
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
