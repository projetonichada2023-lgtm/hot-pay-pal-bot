import { Client, useClientSettings, useUpdateClientSettings } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Loader2, 
  CreditCard, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle2, 
  RotateCcw,
  Crown,
  Zap,
  Building2
} from 'lucide-react';
import { useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { usePlanLimits } from '@/hooks/usePlanLimits';

interface SettingsPageProps {
  client: Client;
}

export const SettingsPage = ({ client }: SettingsPageProps) => {
  const { data: settings, isLoading } = useClientSettings(client.id);
  const updateSettings = useUpdateClientSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { resetOnboarding, isResetting } = useOnboarding(client.id, client.onboarding_completed);
  const { usage } = usePlanLimits();

  const activeTab = searchParams.get('tab') || 'plano';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleRestartTour = () => {
    resetOnboarding();
    toast({ title: 'Redirecionando para o tour...' });
    setTimeout(() => {
      navigate('/dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const handleToggle = async (field: string, value: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, [field]: value });
      toast({ title: 'Configuração atualizada!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleSaveApiKey = async () => {
    if (!settings || !apiKey.trim()) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        fastsoft_api_key: apiKey.trim(),
        fastsoft_enabled: true
      } as any);
      toast({ title: 'Chave secreta salva com sucesso!' });
      setApiKey('');
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleToggleUnipay = async (enabled: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, fastsoft_enabled: enabled } as any);
      toast({ title: enabled ? 'UniPay ativado!' : 'UniPay desativado!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleDisconnect = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        fastsoft_api_key: null,
        fastsoft_public_key: null,
        fastsoft_enabled: false
      } as any);
      toast({ title: 'UniPay desconectado!' });
    } catch (error) {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return null;

  const hasApiKey = !!(settings as any).fastsoft_api_key;
  const unipayEnabled = (settings as any).fastsoft_enabled || false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie seu plano, pagamentos e automações
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="plano" className="gap-2">
            <Crown className="w-4 h-4 hidden sm:inline" />
            Plano
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="gap-2">
            <CreditCard className="w-4 h-4 hidden sm:inline" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="automacoes" className="gap-2">
            <Zap className="w-4 h-4 hidden sm:inline" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="conta" className="gap-2">
            <Building2 className="w-4 h-4 hidden sm:inline" />
            Conta
          </TabsTrigger>
        </TabsList>

        {/* Tab: Plano */}
        <TabsContent value="plano" className="space-y-6">
          <SubscriptionCard 
            currentProductsCount={usage?.productsCount || 0}
            currentOrdersThisMonth={usage?.ordersThisMonth || 0}
            currentRecoveryMessagesCount={usage?.recoveryMessagesCount || 0}
          />
        </TabsContent>

        {/* Tab: Pagamentos */}
        <TabsContent value="pagamentos" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Gateway de Pagamento
                  </CardTitle>
                  <CardDescription>
                    Integração exclusiva com UniPay para pagamentos PIX
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary">UniPay</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasApiKey ? (
                <>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-green-600 dark:text-green-400">
                          UniPay Conectado
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Sua conta está pronta para receber pagamentos PIX
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Pagamentos Ativos</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber pagamentos PIX via UniPay
                      </p>
                    </div>
                    <Switch
                      checked={unipayEnabled}
                      onCheckedChange={handleToggleUnipay}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open('https://unipay.com.br/dashboard', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Acessar Painel UniPay
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDisconnect}
                    >
                      Desconectar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      Conecte sua conta UniPay para começar a receber pagamentos PIX automaticamente.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Chave Secreta UniPay</Label>
                        <div className="relative">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            placeholder="Cole sua chave secreta aqui"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button 
                        onClick={handleSaveApiKey} 
                        disabled={!apiKey.trim()}
                        className="w-full"
                      >
                        Conectar UniPay
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="w-4 h-4" />
                    <span>Não tem uma conta?</span>
                    <a 
                      href="https://unipay.com.br" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Criar conta na UniPay
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Automações */}
        <TabsContent value="automacoes" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automações do Bot
              </CardTitle>
              <CardDescription>Configure o comportamento automático do seu bot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Entrega Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar produto automaticamente após confirmação de pagamento
                  </p>
                </div>
                <Switch
                  checked={settings.auto_delivery}
                  onCheckedChange={(checked) => handleToggle('auto_delivery', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Suporte Ativo</Label>
                  <p className="text-sm text-muted-foreground">Mostrar opção de suporte no menu do bot</p>
                </div>
                <Switch
                  checked={settings.support_enabled}
                  onCheckedChange={(checked) => handleToggle('support_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Lembrete de Carrinho</Label>
                  <p className="text-sm text-muted-foreground">Enviar lembrete automático para pedidos pendentes</p>
                </div>
                <Switch
                  checked={settings.cart_reminder_enabled}
                  onCheckedChange={(checked) => handleToggle('cart_reminder_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Conta */}
        <TabsContent value="conta" className="space-y-6">
          {/* Business Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações do Negócio
              </CardTitle>
              <CardDescription>Dados da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Negócio</Label>
                  <Input value={client.business_name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Status da Conta</Label>
                  <Input value={client.is_active ? 'Ativo' : 'Inativo'} readOnly />
                </div>
                {(client as any).business_email && (
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={(client as any).business_email} readOnly />
                  </div>
                )}
                {client.telegram_bot_username && (
                  <div className="space-y-2">
                    <Label>Bot Telegram</Label>
                    <Input value={`@${client.telegram_bot_username}`} readOnly />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tour/Onboarding */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Tour do Sistema</CardTitle>
              <CardDescription>Reveja o tour de introdução da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Refazer Tour Interativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Reveja o passo a passo de todas as funcionalidades
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleRestartTour}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  Refazer Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
