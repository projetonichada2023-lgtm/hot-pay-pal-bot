import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminClient } from "@/hooks/useAdminClients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientDetailsDialogProps {
  client: AdminClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientDetailsDialog = ({
  client,
  open,
  onOpenChange,
}: ClientDetailsDialogProps) => {
  const { data: clientDetails, isLoading } = useQuery({
    queryKey: ["admin-client-details", client?.id],
    queryFn: async () => {
      if (!client) return null;

      // Get products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client.id);

      // Get orders stats
      const { data: orders } = await supabase
        .from("orders")
        .select("amount, status")
        .eq("client_id", client.id);

      const totalOrders = orders?.length || 0;
      const paidOrders = orders?.filter((o) => o.status === "paid").length || 0;
      const revenue =
        orders
          ?.filter((o) => o.status === "paid")
          .reduce((sum, o) => sum + Number(o.amount), 0) || 0;

      // Get customers count
      const { count: customersCount } = await supabase
        .from("telegram_customers")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client.id);

      return {
        productsCount: productsCount || 0,
        totalOrders,
        paidOrders,
        revenue,
        customersCount: customersCount || 0,
      };
    },
    enabled: !!client,
  });

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client.business_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{client.business_email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{client.business_phone || "-"}</p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Badge variant={client.is_active ? "default" : "destructive"}>
              {client.is_active ? "Ativo" : "Inativo"}
            </Badge>
            <Badge variant={client.webhook_configured ? "default" : "outline"}>
              {client.webhook_configured ? "Bot Configurado" : "Bot Pendente"}
            </Badge>
            <Badge variant={client.onboarding_completed ? "default" : "outline"}>
              {client.onboarding_completed ? "Onboarding Completo" : "Onboarding Pendente"}
            </Badge>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Assinatura</p>
            {client.subscription ? (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Plano</span>
                  <Badge>{client.subscription.plan_type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant="outline">{client.subscription.status}</Badge>
                </div>
                {client.subscription.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-sm">Expira em</span>
                    <span className="text-sm font-medium">
                      {format(new Date(client.subscription.expires_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem assinatura</p>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Estatísticas</p>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Produtos</p>
                  <p className="text-lg font-bold">{clientDetails?.productsCount || 0}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Clientes Telegram</p>
                  <p className="text-lg font-bold">{clientDetails?.customersCount || 0}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                  <p className="text-lg font-bold">
                    {clientDetails?.paidOrders || 0}/{clientDetails?.totalOrders || 0}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Receita</p>
                  <p className="text-lg font-bold">
                    R${" "}
                    {(clientDetails?.revenue || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Cliente desde{" "}
            {format(new Date(client.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
