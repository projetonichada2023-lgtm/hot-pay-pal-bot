import { useState } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight, FileText, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const actionLabels: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  login: 'Login',
  logout: 'Logout',
  settings_update: 'Config. Atualizada',
  admin_added: 'Admin Adicionado',
  admin_removed: 'Admin Removido',
};

const entityLabels: Record<string, string> = {
  client: 'Cliente',
  product: 'Produto',
  order: 'Pedido',
  subscription: 'Assinatura',
  settings: 'Configurações',
  user_roles: 'Roles de Usuário',
  plan_limits: 'Limites de Plano',
};

const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  if (action.includes('delete') || action.includes('removed')) return 'destructive';
  if (action.includes('create') || action.includes('added')) return 'default';
  return 'secondary';
};

export const AdminAuditPage = () => {
  const [entityType, setEntityType] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAuditLogs({
    entityType: entityType || undefined,
    action: action || undefined,
    page,
    pageSize: 15,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
        <p className="text-muted-foreground">
          Histórico de ações administrativas no sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Ações
          </CardTitle>
          <CardDescription>
            Visualize todas as ações realizadas pelos administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={entityType || "all"} onValueChange={(v) => setEntityType(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="product">Produto</SelectItem>
                <SelectItem value="order">Pedido</SelectItem>
                <SelectItem value="subscription">Assinatura</SelectItem>
                <SelectItem value="settings">Configurações</SelectItem>
                <SelectItem value="user_roles">Roles de Usuário</SelectItem>
              </SelectContent>
            </Select>

            <Select value={action || "all"} onValueChange={(v) => setAction(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="admin_added">Admin Adicionado</SelectItem>
                <SelectItem value="admin_removed">Admin Removido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.logs.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entityLabels[log.entity_type] || log.entity_type}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Log</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">ID do Usuário</p>
                                <p className="font-mono text-sm">{log.user_id}</p>
                              </div>
                              {log.entity_id && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">ID da Entidade</p>
                                  <p className="font-mono text-sm">{log.entity_id}</p>
                                </div>
                              )}
                              {log.old_data && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Dados Anteriores</p>
                                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                                    {JSON.stringify(log.old_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_data && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Novos Dados</p>
                                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                                    {JSON.stringify(log.new_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.user_agent && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                                  <p className="text-xs text-muted-foreground break-all">{log.user_agent}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Total: {data.totalCount} registros
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Página {page} de {data.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (data.totalPages || 1)}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
