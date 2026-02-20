import { useAffiliate } from "@/hooks/useAffiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const AffiliateSubAffiliates = () => {
  const { affiliate, subAffiliates, stats, links } = useAffiliate();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  // Use first link code or affiliate id for referral
  const refCode = links[0]?.code || affiliate?.id?.slice(0, 8).toUpperCase() || "";
  const inviteUrl = `https://conversyapp.com/affiliate?ref=${refCode}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Link de convite copiado!");
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
      <div className="grid gap-4 md:grid-cols-3">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa para Subs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {affiliate?.sub_commission_rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Você fica com {(affiliate?.commission_rate || 0) - (affiliate?.sub_commission_rate || 0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invite Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">🔗 Link de Convite para Subafiliados</h3>
          <p className="text-sm text-muted-foreground">
            Compartilhe este link para convidar novos subafiliados. Eles receberão{" "}
            <strong>{affiliate?.sub_commission_rate}%</strong> de comissão e você ficará com{" "}
            <strong>{(affiliate?.commission_rate || 0) - (affiliate?.sub_commission_rate || 0)}%</strong>.
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
            <div className="space-y-3">
              {subAffiliates.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{sub.name}</p>
                    <p className="text-xs text-muted-foreground">{sub.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Desde {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">
                      {formatCurrency(sub.total_earnings || 0)}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : sub.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {sub.status === "approved" ? "Aprovado" : sub.status === "pending" ? "Pendente" : sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
