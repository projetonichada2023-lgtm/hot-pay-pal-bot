import { Bot, Send, MessageSquare, Zap, Shield, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

export function BotConfig() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 animate-slide-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-telegram flex items-center justify-center">
            <Send className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Telegram Bot</h2>
            <p className="text-muted-foreground">Configure seu bot de vendas</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-success font-medium">Conectado</span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <label className="text-sm text-muted-foreground mb-2 block">Bot Token</label>
            <input
              type="password"
              value="••••••••••••••••••••••••••••••••••"
              readOnly
              className="w-full bg-transparent text-foreground font-mono text-sm focus:outline-none"
            />
          </div>
          
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <label className="text-sm text-muted-foreground mb-2 block">Bot Username</label>
            <p className="text-foreground font-medium">@SeuBot_HotBot</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Mensagens Automáticas
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Boas-vindas</p>
                <p className="text-sm text-muted-foreground">Mensagem ao iniciar conversa</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Confirmação de Compra</p>
                <p className="text-sm text-muted-foreground">Enviar após pagamento</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Lembrete de Carrinho</p>
                <p className="text-sm text-muted-foreground">Abandono de carrinho</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Automações
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Entrega Automática</p>
                <p className="text-sm text-muted-foreground">Enviar produto digital</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Upsell Automático</p>
                <p className="text-sm text-muted-foreground">Oferecer produtos relacionados</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Suporte 24h</p>
                <p className="text-sm text-muted-foreground">Respostas automáticas</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notificações
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <p className="text-3xl font-bold gradient-text mb-1">1.247</p>
            <p className="text-sm text-muted-foreground">Mensagens Hoje</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <p className="text-3xl font-bold gradient-text mb-1">89</p>
            <p className="text-sm text-muted-foreground">Novos Usuários</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <p className="text-3xl font-bold gradient-text mb-1">34</p>
            <p className="text-sm text-muted-foreground">Vendas via Bot</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="hot" size="lg" className="flex-1">
          <Bot className="w-5 h-5" />
          Testar Bot
        </Button>
        <Button variant="outline" size="lg">
          <Shield className="w-5 h-5" />
          Configurações Avançadas
        </Button>
      </div>
    </div>
  );
}
