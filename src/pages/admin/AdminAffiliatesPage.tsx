import { useState } from "react";
import { useAdminAffiliates } from "@/hooks/useAdminAffiliates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  MoreHorizontal,
  Search,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Affiliate } from "@/hooks/useAffiliate";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
  approved: { label: "Aprovado", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "Rejeitado", variant: "destructive" as const, icon: XCircle },
  suspended: { label: "Suspenso", variant: "outline" as const, icon: Ban },
};

export const AdminAffiliatesPage = () => {
  const { affiliates, isLoading, stats, updateAffiliateStatus, updateCommissionRate, refetch } = useAdminAffiliates();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [newCommissionRate, setNewCommissionRate] = useState("");

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      affiliate.name.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || affiliate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (affiliateId: string, status: "pending" | "approved" | "rejected" | "suspended") => {
    updateAffiliateStatus.mutate({ affiliateId, status });
  };

  const handleCommissionUpdate = () => {
    if (selectedAffiliate && newCommissionRate) {
      updateCommissionRate.mutate({
        affiliateId: selectedAffiliate.id,
        commissionRate: parseFloat(newCommissionRate),
      });
      setCommissionDialogOpen(false);
      setSelectedAffiliate(null);
      setNewCommissionRate("");
    }
  };

  const openCommissionDialog = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setNewCommissionRate(affiliate.commission_rate.toString());
    setCommissionDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Afiliados</h1>
          <p className="text-muted-foreground">Gerencie e aprove afiliados da plataforma</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Afiliados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved} aprovados
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ganhos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Comissões pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Indicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Clientes indicados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected", "suspended"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "Todos" : statusConfig[status as keyof typeof statusConfig].label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Ganhos</TableHead>
                <TableHead>Indicações</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffiliates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum afiliado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredAffiliates.map((affiliate) => {
                  const StatusIcon = statusConfig[affiliate.status].icon;
                  return (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{affiliate.name}</p>
                          <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                          {affiliate.phone && (
                            <p className="text-xs text-muted-foreground">{affiliate.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[affiliate.status].variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[affiliate.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{affiliate.commission_rate}%</span>
                      </TableCell>
                      <TableCell>
                        R$ {(affiliate.total_earnings || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{affiliate.total_referrals || 0}</TableCell>
                      <TableCell>
                        {format(new Date(affiliate.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {affiliate.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(affiliate.id, "approved")}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(affiliate.id, "rejected")}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Rejeitar
                                </DropdownMenuItem>
                              </>
                            )}
                            {affiliate.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(affiliate.id, "suspended")}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspender
                              </DropdownMenuItem>
                            )}
                            {(affiliate.status === "suspended" || affiliate.status === "rejected") && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(affiliate.id, "approved")}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Reativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openCommissionDialog(affiliate)}>
                              <Percent className="h-4 w-4 mr-2" />
                              Alterar Comissão
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commission Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Taxa de Comissão</DialogTitle>
            <DialogDescription>
              Defina a nova taxa de comissão para {selectedAffiliate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Taxa de Comissão (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={newCommissionRate}
                onChange={(e) => setNewCommissionRate(e.target.value)}
                placeholder="Ex: 10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommissionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCommissionUpdate} disabled={updateCommissionRate.isPending}>
              {updateCommissionRate.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
