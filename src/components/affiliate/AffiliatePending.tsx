import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, LogOut, MessageCircle } from "lucide-react";
import conversyLogo from "@/assets/conversy-logo.png";

export const AffiliatePending = () => {
  const { signOut } = useAuth();

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
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>

          <h1 className="text-2xl font-display font-bold mb-4">
            Cadastro em Análise
          </h1>

          <p className="text-muted-foreground mb-8">
            Seu cadastro foi recebido e está sendo analisado pela nossa equipe. 
            Você receberá um email assim que for aprovado.
          </p>

          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">O que acontece agora?</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>✓ Nosso time irá analisar seu perfil</li>
                <li>✓ Prazo de análise: até 48 horas úteis</li>
                <li>✓ Você será notificado por email</li>
                <li>✓ Após aprovação, acesse o dashboard</li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Dúvidas? Entre em contato conosco
            </p>
            <Button variant="outline" asChild>
              <a
                href="https://t.me/conversysuporte"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Falar com Suporte
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
