import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useAdminClients } from "@/hooks/useAdminClients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type PlanType = "free" | "basic" | "pro" | "enterprise";
type StatusType = "active" | "cancelled" | "expired" | "trial" | "pending";
type BillingCycle = "monthly" | "yearly";

export const AdminSubscriptionsPage = () => {
  const { subscriptions, isLoading, createSubscription, updateSubscription, deleteSubscription } =
    useAdminSubscriptions();
  const { clients } = useAdminClients();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [newSub, setNewSub] = useState({
    client_id: "",
    plan_type: "basic" as PlanType,
    status: "trial" as StatusType,
    price: 0,
    billing_cycle: "monthly" as BillingCycle,
    expires_at: "",
  });

  const filteredSubscriptions =
    statusFilter === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.status === statusFilter);

  // Filter clients without subscription
  const availableClients = clients.filter(
    (c) => !subscriptions.some((s) => s.client_id === c.id)
  );

  const handleCreate = () => {
    createSubscription.mutate(
      {
        client_id: newSub.client_id,
        plan_type: newSub.plan_type,
        status: newSub.status,
        price: newSub.price,
        billing_cycle: newSub.billing_cycle,
        expires_at: newSub.expires_at || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewSub({
            client_id: "",
            plan_type: "basic",
            status: "trial",
            price: 0,
            billing_cycle: "monthly",
            expires_at: "",
          });
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      trial: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      expired: "bg-red-500/10 text-red-500 border-red-500/20",
      cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    };
    return (
      <Badge className={colors[status] || colors.pending} variant="outline">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie as assinaturas dos clientes</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assinaturas</h1>
        <p className="text-muted-foreground">Gerencie as assinaturas dos clientes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Assinaturas ({filteredSubscriptions.length})</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button disabled={availableClients.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Assinatura
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Assinatura</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Cliente</Label>
                      <Select
                        value={newSub.client_id}
                        onValueChange={(v) => setNewSub({ ...newSub, client_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.business_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Plano</Label>
                        <Select
                          value={newSub.plan_type}
                          onValueChange={(v: PlanType) =>
                            setNewSub({ ...newSub, plan_type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Status</Label>
                        <Select
                          value={newSub.status}
                          onValueChange={(v: StatusType) =>
                            setNewSub({ ...newSub, status: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trial">Trial</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Preço (R$)</Label>
                        <Input
                          type="number"
                          value={newSub.price}
                          onChange={(e) =>
                            setNewSub({ ...newSub, price: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div>
                        <Label>Ciclo</Label>
                        <Select
                          value={newSub.billing_cycle}
                          onValueChange={(v: BillingCycle) =>
                            setNewSub({ ...newSub, billing_cycle: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Data de Expiração</Label>
                      <Input
                        type="date"
                        value={newSub.expires_at}
                        onChange={(e) =>
                          setNewSub({ ...newSub, expires_at: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleCreate}
                      disabled={!newSub.client_id || createSubscription.isPending}
                    >
                      {createSubscription.isPending ? "Criando..." : "Criar Assinatura"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {sub.client?.business_name || "Cliente removido"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sub.plan_type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      R$ {Number(sub.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{sub.billing_cycle === "yearly" ? "Anual" : "Mensal"}</TableCell>
                    <TableCell>
                      {sub.expires_at
                        ? format(new Date(sub.expires_at), "dd/MM/yyyy", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newStatus = sub.status === "active" ? "cancelled" : "active";
                            updateSubscription.mutate({
                              id: sub.id,
                              status: newStatus as StatusType,
                              cancelled_at:
                                newStatus === "cancelled" ? new Date().toISOString() : null,
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteSubscription.mutate(sub.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSubscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma assinatura encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
