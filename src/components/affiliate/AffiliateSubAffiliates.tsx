import { useState } from "react";
import { useAffiliate } from "@/hooks/useAffiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, DollarSign, Loader2, Save, CheckCircle, XCircle, Ban } from "lucide-react";
import { toast } from "sonner";

export const AffiliateSubAffiliates = () => {
  const { affiliate, subAffiliates, stats, links, updateSubAffiliateRate, updateSubAffiliateStatus } = useAffiliate();
  const [editingRates, setEditingRates] = useState<Record<string, number>>({});

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const refCode = links[0]?.code || affiliate?.id?.slice(0, 8).toUpperCase() || "";
  const inviteUrl = `https://conversyapp.com/affiliate/auth?ref=${refCode}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Link de convite copiado!");
  };

  const getRate = (subId: string, currentRate: number) =>
    editingRates[subId] ?? currentRate;

  const handleSaveRate = async (subId: string) => {
    const rate = editingRates[subId];
    if (rate === undefined) return;
    await updateSubAffiliateRate.mutateAsync({ subId, rate });
    setEditingRates((prev) => {
      const next = { ...prev };
      delete next[subId];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Subafiliados</h2>
        <p className="text-muted-foreground">
          Convide outros afiliados e ganhe comissões sobre as vendas deles
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subafiliados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubAffiliates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Indiretos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.indirectEarnings)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">🔗 Link de Convite para Subafiliados</h3>
          <p className="text-sm text-muted-foreground">
            Compartilhe este link para convidar novos subafiliados.
          </p>
          <div className="flex items-center gap-2">
            <Input value={inviteUrl} readOnly className="text-xs font-mono bg-muted" />
            <Button variant="outline" size="icon" onClick={copyInviteLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub-affiliates List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Subafiliados</CardTitle>
        </CardHeader>
        <CardContent>
          {subAffiliates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum subafiliado ainda. Compartilhe seu link de convite para começar!
            </p>
          ) : (
            <div className="space-y-4">
              {subAffiliates.map((sub) => {
                const rate = getRate(sub.id, sub.sub_commission_rate);
                const hasChanged = editingRates[sub.id] !== undefined;

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-lg bg-muted/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Desde {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium text-primary">
                          {formatCurrency(sub.total_earnings || 0)}
                        </p>
                        <Badge
                          variant={
                            sub.status === "approved" ? "default" :
                            sub.status === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {sub.status === "approved" ? "Aprovado" : sub.status === "pending" ? "Pendente" : sub.status === "rejected" ? "Rejeitado" : "Suspenso"}
                        </Badge>
                      </div>
                    </div>

                    {/* Approve/Reject actions for pending subs */}
                    {sub.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1"
                          onClick={() => updateSubAffiliateStatus.mutate({ subId: sub.id, status: "approved" })}
                          disabled={updateSubAffiliateStatus.isPending}
                        >
                          <CheckCircle className="w-3 h-3" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => updateSubAffiliateStatus.mutate({ subId: sub.id, status: "rejected" })}
                          disabled={updateSubAffiliateStatus.isPending}
                        >
                          <XCircle className="w-3 h-3" /> Rejeitar
                        </Button>
                      </div>
                    )}
                    {sub.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => updateSubAffiliateStatus.mutate({ subId: sub.id, status: "suspended" })}
                        disabled={updateSubAffiliateStatus.isPending}
                      >
                        <Ban className="w-3 h-3" /> Suspender
                      </Button>
                    )}
                    {(sub.status === "suspended" || sub.status === "rejected") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => updateSubAffiliateStatus.mutate({ subId: sub.id, status: "approved" })}
                        disabled={updateSubAffiliateStatus.isPending}
                      >
                        <CheckCircle className="w-3 h-3" /> Reativar
                      </Button>
                    )}

                    {/* Per-sub rate slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Comissão do sub: <strong>{rate}%</strong>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Você fica com: <strong>{((affiliate?.commission_rate || 0) - rate).toFixed(1)}%</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[rate]}
                          onValueChange={(v) =>
                            setEditingRates((prev) => ({ ...prev, [sub.id]: v[0] }))
                          }
                          max={affiliate?.commission_rate || 10}
                          min={0}
                          step={0.5}
                          className="flex-1"
                        />
                        {hasChanged && (
                          <Button
                            size="sm"
                            onClick={() => handleSaveRate(sub.id)}
                            disabled={updateSubAffiliateRate.isPending}
                          >
                            {updateSubAffiliateRate.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
