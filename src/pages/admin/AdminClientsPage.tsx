import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminClients, AdminClient } from "@/hooks/useAdminClients";
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, LogIn, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientDetailsDialog } from "@/components/admin/ClientDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { setImpersonationFlag } from "@/components/dashboard/ImpersonationBanner";

export const AdminClientsPage = () => {
  const { clients, isLoading, toggleClientActive } = useAdminClients();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [clientToImpersonate, setClientToImpersonate] = useState<AdminClient | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.business_name.toLowerCase().includes(search.toLowerCase()) ||
      client.business_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleImpersonate = async (client: AdminClient) => {
    setClientToImpersonate(null);
    setImpersonatingId(client.user_id);
    try {
      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { 
          targetUserId: client.user_id,
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Set impersonation flag before redirecting
        if (user?.email) {
          setImpersonationFlag(user.email);
        }
        toast.success(`Redirecionando para conta de ${client.business_name}...`);
        window.location.href = data.url;
      } else {
        toast.error('Não foi possível gerar o link de acesso');
      }
    } catch (error: unknown) {
      console.error('Impersonation error:', error);
      toast.error('Erro ao acessar conta do cliente');
    } finally {
      setImpersonatingId(null);
    }
  };

  const getPlanBadge = (planType?: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      free: "outline",
      basic: "secondary",
      pro: "default",
      enterprise: "destructive",
    };
    return (
      <Badge variant={variants[planType || "free"] || "outline"}>
        {planType || "Sem plano"}
      </Badge>
    );
  };

  const getStatusBadge = (status?: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/10 text-green-500",
      trial: "bg-blue-500/10 text-blue-500",
      expired: "bg-red-500/10 text-red-500",
      cancelled: "bg-gray-500/10 text-gray-500",
      pending: "bg-yellow-500/10 text-yellow-500",
    };
    return (
      <Badge className={colors[status || "pending"] || colors.pending} variant="outline">
        {status || "Pendente"}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie todos os clientes da plataforma</p>
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
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground">Gerencie todos os clientes da plataforma</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Clientes ({filteredClients.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negócio</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status Assinatura</TableHead>
                  <TableHead>Bot Configurado</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.business_name}</TableCell>
                    <TableCell>{client.business_email || "-"}</TableCell>
                    <TableCell>{getPlanBadge(client.subscription?.plan_type)}</TableCell>
                    <TableCell>{getStatusBadge(client.subscription?.status)}</TableCell>
                    <TableCell>
                      <Badge variant={client.webhook_configured ? "default" : "outline"}>
                        {client.webhook_configured ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={client.is_active}
                        onCheckedChange={(checked) =>
                          toggleClientActive.mutate({
                            clientId: client.id,
                            isActive: checked,
                            clientName: client.business_name,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setClientToImpersonate(client)}
                          disabled={impersonatingId === client.user_id}
                          title="Acessar conta"
                        >
                          {impersonatingId === client.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogIn className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ClientDetailsDialog
        client={selectedClient}
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
      />

      {/* Confirm Impersonation Dialog */}
      <AlertDialog open={!!clientToImpersonate} onOpenChange={(open) => !open && setClientToImpersonate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acessar conta do cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a acessar a conta de{' '}
              <strong>{clientToImpersonate?.business_name}</strong>.
              <br /><br />
              Um link será gerado e abrirá em uma nova aba. Esta ação será registrada nos logs de auditoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => clientToImpersonate && handleImpersonate(clientToImpersonate)}>
              Acessar Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
