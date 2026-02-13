import { useState } from "react";
import { useAffiliate } from "@/hooks/useAffiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Copy, 
  ExternalLink,
  MousePointerClick,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const AffiliateLinks = () => {
  const { links, createLink, affiliate } = useAffiliate();
  const [isCreating, setIsCreating] = useState(false);

  const baseUrl = 'https://conversyapp.com';

  const handleCreateLink = async () => {
    setIsCreating(true);
    try {
      await createLink.mutateAsync({});
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    const fullUrl = `${baseUrl}/?ref=${code}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Seus Links</h2>
          <p className="text-muted-foreground">
            Crie e gerencie seus links de afiliado
          </p>
        </div>
        <Button onClick={handleCreateLink} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem nenhum link de afiliado.
            </p>
            <Button onClick={handleCreateLink} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {links.map((link) => {
            const fullUrl = `${baseUrl}/?ref=${link.code}`;
            const conversionRate = link.clicks > 0 
              ? ((link.conversions / link.clicks) * 100).toFixed(1)
              : "0.0";

            return (
              <Card key={link.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Link Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded bg-muted text-sm font-mono">
                          {link.code}
                        </code>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            link.is_active
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {link.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={fullUrl}
                          readOnly
                          className="text-xs font-mono bg-muted"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(link.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(fullUrl, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <MousePointerClick className="w-4 h-4" />
                        </div>
                        <p className="text-xl font-bold">{link.clicks}</p>
                        <p className="text-xs text-muted-foreground">Cliques</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-xl font-bold">{link.conversions}</p>
                        <p className="text-xs text-muted-foreground">Vendas</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-primary">{conversionRate}%</p>
                        <p className="text-xs text-muted-foreground">Conversão</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Help Text */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">💡 Dica</h3>
          <p className="text-sm text-muted-foreground">
            Compartilhe seus links nas redes sociais, grupos do Telegram e WhatsApp. 
            Cada venda realizada através do seu link gera uma comissão de{" "}
            <strong className="text-primary">{affiliate?.commission_rate}%</strong> para você!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
