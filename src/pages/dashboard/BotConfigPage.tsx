import { useState } from 'react';
import { Client, useUpdateClient } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Bot, Zap, CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface BotConfigPageProps {
  client: Client;
}

export const BotConfigPage = ({ client }: BotConfigPageProps) => {
  const [token, setToken] = useState(client.telegram_bot_token || '');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const updateClient = useUpdateClient();
  const { toast } = useToast();

  const handleConfigureBot = async () => {
    if (!token.trim()) {
      toast({ title: 'Insira o token do bot', variant: 'destructive' });
      return;
    }

    setIsConfiguring(true);

    try {
      // First, get bot info from Telegram
      const botInfoRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const botInfo = await botInfoRes.json();

      if (!botInfo.ok) {
        throw new Error('Token inválido');
      }

      // Update client with bot token and username
      await updateClient.mutateAsync({
        id: client.id,
        telegram_bot_token: token,
        telegram_bot_username: botInfo.result.username,
      });

      // Configure webhook via edge function
      const { data, error } = await supabase.functions.invoke('configure-client-webhook', {
        body: { client_id: client.id, bot_token: token },
      });

      if (error) throw error;

      // Update webhook_configured status
      await updateClient.mutateAsync({
        id: client.id,
        webhook_configured: true,
      });

      toast({ 
        title: 'Bot configurado com sucesso!',
        description: `@${botInfo.result.username} está pronto para receber pedidos.`
      });
    } catch (error) {
      console.error('Error configuring bot:', error);
      toast({ 
        title: 'Erro ao configurar bot',
        description: error instanceof Error ? error.message : 'Verifique o token e tente novamente',
        variant: 'destructive'
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const copyWebhookUrl = () => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook`;
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copiada!' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Configuração do Bot
        </h1>
        <p className="text-muted-foreground">
          Configure seu bot do Telegram para começar a vender
        </p>
      </div>

      {/* Status Card */}
      <Card className={`glass-card border-l-4 ${client.webhook_configured ? 'border-l-success' : 'border-l-warning'}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {client.webhook_configured ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <AlertCircle className="w-6 h-6 text-warning" />
            )}
            <div>
              <CardTitle>
                {client.webhook_configured ? 'Bot Ativo' : 'Bot Não Configurado'}
              </CardTitle>
              <CardDescription>
                {client.webhook_configured 
                  ? `@${client.telegram_bot_username} está recebendo pedidos`
                  : 'Configure o token do bot para começar'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Token Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Token do Bot</CardTitle>
          <CardDescription>
            Obtenha o token criando um bot com o @BotFather no Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bot-token">Token do Bot</Label>
            <Input
              id="bot-token"
              type="password"
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              O token é usado para conectar ao seu bot e configurar o webhook automaticamente
            </p>
          </div>

          <Button 
            onClick={handleConfigureBot}
            disabled={isConfiguring || !token.trim()}
            className="gradient-hot glow-hot"
          >
            {isConfiguring ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {client.webhook_configured ? 'Reconfigurar Bot' : 'Configurar Bot'}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Info */}
      {client.webhook_configured && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Informações do Webhook</CardTitle>
            <CardDescription>
              Detalhes técnicos da integração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL do Webhook</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook`}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bot Username</Label>
              <Input
                readOnly
                value={`@${client.telegram_bot_username}`}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Como criar um bot no Telegram</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Abra o Telegram e procure por <strong>@BotFather</strong></li>
            <li>Envie o comando <code className="px-1 py-0.5 bg-secondary rounded">/newbot</code></li>
            <li>Escolha um nome para seu bot (ex: Minha Loja Bot)</li>
            <li>Escolha um username (deve terminar em "bot", ex: minhaloja_bot)</li>
            <li>Copie o token enviado e cole acima</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
