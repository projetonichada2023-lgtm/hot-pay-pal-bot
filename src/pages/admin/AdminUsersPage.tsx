import { useState } from "react";
import { useAdminUsers, useAllUsers, useAddAdmin, useRemoveAdmin } from "@/hooks/useAdminUsers";
import { useCreateAuditLog } from "@/hooks/useAuditLogs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, ShieldOff, UserPlus, Users } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const AdminUsersPage = () => {
  const { data: adminUsers, isLoading: loadingAdmins } = useAdminUsers();
  const { data: allUsers, isLoading: loadingUsers } = useAllUsers();
  const addAdmin = useAddAdmin();
  const removeAdmin = useRemoveAdmin();
  const createAuditLog = useCreateAuditLog();

  const [userToRemove, setUserToRemove] = useState<{ userId: string; name?: string } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleAddAdmin = async (userId: string, userName?: string) => {
    await addAdmin.mutateAsync(userId);
    await createAuditLog.mutateAsync({
      action: 'admin_added',
      entity_type: 'user_roles',
      entity_id: userId,
      new_data: { role: 'admin', user_name: userName },
    });
    setAddDialogOpen(false);
  };

  const handleRemoveAdmin = async () => {
    if (!userToRemove) return;
    
    await removeAdmin.mutateAsync(userToRemove.userId);
    await createAuditLog.mutateAsync({
      action: 'admin_removed',
      entity_type: 'user_roles',
      entity_id: userToRemove.userId,
      old_data: { role: 'admin', user_name: userToRemove.name },
      new_data: { role: 'client' },
    });
    setUserToRemove(null);
  };

  const nonAdminUsers = allUsers?.filter(u => !u.isAdmin) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Administradores</h1>
          <p className="text-muted-foreground">
            Adicione ou remova permissões de administrador
          </p>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Administrador</DialogTitle>
              <DialogDescription>
                Selecione um usuário para conceder permissões de administrador
              </DialogDescription>
            </DialogHeader>

            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : nonAdminUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Todos os usuários já são administradores
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Negócio</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nonAdminUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.business_name}
                      </TableCell>
                      <TableCell>{user.business_email || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAddAdmin(user.user_id, user.business_name)}
                          disabled={addAdmin.isPending}
                        >
                          {addAdmin.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Shield className="h-4 w-4 mr-1" />
                          )}
                          Tornar Admin
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administradores Atuais
          </CardTitle>
          <CardDescription>
            Lista de usuários com permissões administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAdmins ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !adminUsers?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum administrador encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Negócio</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.business_name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{admin.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setUserToRemove({ userId: admin.user_id, name: admin.business_name })}
                      >
                        <ShieldOff className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirm Remove Dialog */}
      <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover administrador?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover as permissões de administrador de{' '}
              <strong>{userToRemove?.name || 'este usuário'}</strong>?
              <br />
              O usuário perderá acesso ao painel administrativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeAdmin.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Remover'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
