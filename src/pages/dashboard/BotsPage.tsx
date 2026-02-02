import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Client } from '@/hooks/useClient';
import { useClientBots, useDeleteClientBot, useSetPrimaryBot, useUpdateClientBot } from '@/hooks/useClientBots';
import { useBotContext } from '@/contexts/BotContext';
import { BotCard } from '@/components/bots/BotCard';
import { AddBotDialog } from '@/components/bots/AddBotDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Bot, Plus, Loader2, AlertTriangle, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BotsPageProps {
  client: Client;
}

export const BotsPage = ({ client }: BotsPageProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: bots = [], isLoading, refetch } = useClientBots(client.id);
  const { selectedBot, setSelectedBot } = useBotContext();
  const deleteBot = useDeleteClientBot();
  const setPrimaryBot = useSetPrimaryBot();
  const updateBot = useUpdateClientBot();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialogBot, setDeleteDialogBot] = useState<string | null>(null);
  const [configuringBot, setConfiguringBot] = useState<string | null>(null);
  const [botToken, setBotToken] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Open add dialog if URL has action=add
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsAddDialogOpen(true);
    }
  }, [searchParams]);

  const handleDeleteBot = async () => {
    if (!deleteDialogBot) return;
    
    await deleteBot.mutateAsync({ id: deleteDialogBot, clientId: client.id });
    setDeleteDialogBot(null);
  };

  const handleSetPrimary = async (botId: string) => {
    await setPrimaryBot.mutateAsync({ botId, clientId: client.id });
  };

  const handleConfigureBot = async (botId: string) => {
    if (!botToken.trim()) {
      toast({
        title: 'Token inválido',
        description: 'Por favor, insira um token válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsConfiguring(true);
    
    try {
      // Validate token with Telegram
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error('Token inválido. Verifique e tente novamente.');
      }

      const botUsername = data.result.username;

      // Update bot with token and username
      await updateBot.mutateAsync({
        id: botId,
        clientId: client.id,
        telegram_bot_token: botToken,
        telegram_bot_username: botUsername,
      });

      // Configure webhook
      const { error: webhookError } = await supabase.functions.invoke('configure-client-webhook', {
        body: { botId },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
        toast({
          title: 'Bot configurado parcialmente',
          description: 'Token salvo, mas o webhook não foi configurado. Tente novamente.',
          variant: 'destructive',
        });
      } else {
        await updateBot.mutateAsync({
          id: botId,
          clientId: client.id,
          webhook_configured: true,
        });
        
        toast({
          title: 'Bot configurado!',
          description: `@${botUsername} está pronto para uso.`,
        });
      }

      setConfiguringBot(null);
      setBotToken('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro ao configurar bot',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const copyWebhookUrl = (botId: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook?bot_id=${botId}`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
    toast({
      title: 'URL copiada!',
      description: 'URL do webhook copiada para a área de transferência.',
    });
  };

  const botBeingConfigured = bots.find(b => b.id === configuringBot);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meus Bots</h1>
          <p className="text-muted-foreground">
            Gerencie seus bots do Telegram. Cada bot pode ter seu próprio catálogo de produtos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3">
            {bots.length} bot{bots.length !== 1 ? 's' : ''}
          </Badge>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Bot
          </Button>
        </div>
      </div>

      {/* Bots Grid */}
      {bots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum bot configurado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie seu primeiro bot para começar a vender no Telegram.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              isSelected={selectedBot?.id === bot.id}
              onSelect={() => setSelectedBot(bot)}
              onEdit={() => {
                setConfiguringBot(bot.id);
                setBotToken(''); // Token não é exposto por segurança - usuário deve inserir novo valor
              }}
              onDelete={() => setDeleteDialogBot(bot.id)}
              onSetPrimary={() => handleSetPrimary(bot.id)}
            />
          ))}
        </div>
      )}

      {/* Bot Configuration Dialog */}
      {configuringBot && botBeingConfigured && (
        <Card className="mt-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Configurar {botBeingConfigured.name}
            </CardTitle>
            <CardDescription>
              Configure o token do Telegram e o webhook para este bot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Token do Bot</label>
              <Input
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                disabled={isConfiguring}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha o token através do{' '}
                <a 
                  href="https://t.me/botfather" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @BotFather
                  <ExternalLink className="w-3 h-3 inline ml-1" />
                </a>
              </p>
            </div>

            {botBeingConfigured.webhook_configured && (
              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Webhook</label>
                <div className="flex gap-2">
                  <Input
                    value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook?bot_id=${botBeingConfigured.id}`}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyWebhookUrl(botBeingConfigured.id)}
                  >
                    {copiedWebhook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleConfigureBot(configuringBot)}
                disabled={isConfiguring}
              >
                {isConfiguring && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar e Configurar Webhook
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConfiguringBot(null);
                  setBotToken('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Bot Dialog */}
      <AddBotDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            navigate('/dashboard/bots', { replace: true });
          }
        }}
        clientId={client.id}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogBot} onOpenChange={() => setDeleteDialogBot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Excluir Bot
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os produtos, pedidos e configurações 
              deste bot serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBot}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBot.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
