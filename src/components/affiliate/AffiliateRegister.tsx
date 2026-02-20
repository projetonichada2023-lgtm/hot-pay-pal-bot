import { useState, useEffect } from "react";
import { useAffiliate } from "@/hooks/useAffiliate";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, LogOut, Users, DollarSign, TrendingUp } from "lucide-react";
import conversyLogo from "@/assets/conversy-logo.png";

export const AffiliateRegister = () => {
  const { user, signOut } = useAuth();
  const { registerAffiliate } = useAffiliate();
  const [searchParams] = useSearchParams();
  const [parentAffiliateId, setParentAffiliateId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    pix_key: "",
    pix_key_type: "cpf",
  });

  // Detect ref code from URL and find parent affiliate
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      supabase
        .from("affiliate_links")
        .select("affiliate_id")
        .eq("code", refCode)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setParentAffiliateId(data.affiliate_id);
        });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerAffiliate.mutateAsync({
      ...formData,
      parent_affiliate_id: parentAffiliateId || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <img src={conversyLogo} alt="Conversy" className="h-8" />
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Programa de Afiliados
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ganhe comissões divulgando a Conversy. Cadastre-se agora e comece a lucrar!
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <DollarSign className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Comissões Atrativas</h3>
                <p className="text-sm text-muted-foreground">
                  Ganhe até 30% de comissão em cada venda realizada
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Fácil de Divulgar</h3>
                <p className="text-sm text-muted-foreground">
                  Links personalizados e materiais de divulgação prontos
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <TrendingUp className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Dashboard Completo</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seus ganhos e métricas em tempo real
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Cadastro de Afiliado</CardTitle>
              <CardDescription>
                Preencha seus dados para se tornar um afiliado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>

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
                        <SelectValue placeholder="Selecione" />
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

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={registerAffiliate.isPending}
                >
                  {registerAffiliate.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Enviar Cadastro
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao se cadastrar, você concorda com nossos{" "}
                  <a href="/termos-de-uso" className="text-primary hover:underline">
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a href="/politica-de-privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
