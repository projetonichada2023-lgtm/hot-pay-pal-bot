import { useState } from "react";
import { useAffiliate } from "@/hooks/useAffiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export const AffiliateSettings = () => {
  const { affiliate, updateProfile } = useAffiliate();
  const [formData, setFormData] = useState({
    name: affiliate?.name || "",
    email: affiliate?.email || "",
    phone: affiliate?.phone || "",
    pix_key: affiliate?.pix_key || "",
    pix_key_type: affiliate?.pix_key_type || "cpf",
    sub_commission_rate: affiliate?.sub_commission_rate || 2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie seu perfil e dados de pagamento
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="text-lg font-semibold">Dados para Pagamento</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pix_key_type">Tipo de Chave PIX</Label>
                <Select
                  value={formData.pix_key_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pix_key_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input
                  id="pix_key"
                  value={formData.pix_key}
                  onChange={(e) =>
                    setFormData({ ...formData, pix_key: e.target.value })
                  }
                  placeholder="Sua chave PIX"
                />
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="text-lg font-semibold">Taxa para Subafiliados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Defina quanto da sua comissão ({affiliate?.commission_rate}%) você quer compartilhar com seus subafiliados.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Taxa para Subafiliados: {formData.sub_commission_rate}%</Label>
                <Slider
                  value={[formData.sub_commission_rate]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sub_commission_rate: value[0] })
                  }
                  max={affiliate?.commission_rate || 10}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subafiliado recebe: {formData.sub_commission_rate}%</span>
                  <span>Você fica com: {((affiliate?.commission_rate || 0) - formData.sub_commission_rate).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Taxa de Comissão</p>
              <p className="text-sm text-muted-foreground">
                Sua taxa de comissão por venda
              </p>
            </div>
            <span className="text-2xl font-bold text-primary">
              {affiliate?.commission_rate}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Status da Conta</p>
              <p className="text-sm text-muted-foreground">
                Situação do seu cadastro
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium">
              {affiliate?.status === "approved" ? "Aprovado" : affiliate?.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Membro desde</p>
              <p className="text-sm text-muted-foreground">
                Data de cadastro
              </p>
            </div>
            <span className="text-muted-foreground">
              {affiliate?.created_at
                ? new Date(affiliate.created_at).toLocaleDateString("pt-BR")
                : "-"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
