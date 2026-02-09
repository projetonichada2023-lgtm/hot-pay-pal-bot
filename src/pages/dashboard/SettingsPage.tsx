import { useState, useEffect } from 'react';
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
  Building2,
  Bell,
  BellOff,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { 
  subscribeToPush, 
  unsubscribeFromPush, 
  checkPushSupport, 
  sendTestNotification 
} from '@/lib/push-notifications';

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
  const [showDuttyfyKey, setShowDuttyfyKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [duttyfyKey, setDuttyfyKey] = useState('');
  const { resetOnboarding, isResetting } = useOnboarding(client.id, client.onboarding_completed);
  const { usage } = usePlanLimits();
  
  // Push notification state
  const [pushSupport, setPushSupport] = useState<{
    supported: boolean;
    permission: NotificationPermission | 'unsupported';
    subscribed: boolean;
  }>({ supported: false, permission: 'unsupported', subscribed: false });
  const [isPushLoading, setIsPushLoading] = useState(false);

  useEffect(() => {
    checkPushSupport().then(setPushSupport);
  }, []);

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

  const handleSaveDuttyfyKey = async () => {
    if (!settings || !duttyfyKey.trim()) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        duttyfy_api_key: duttyfyKey.trim(),
        duttyfy_enabled: true,
        active_payment_gateway: 'duttyfy'
      } as any);
      toast({ title: 'DuttyFy conectado com sucesso!' });
      setDuttyfyKey('');
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleToggleDuttyfy = async (enabled: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, duttyfy_enabled: enabled } as any);
      toast({ title: enabled ? 'DuttyFy ativado!' : 'DuttyFy desativado!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleDisconnectDuttyfy = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        duttyfy_api_key: null,
        duttyfy_enabled: false,
        active_payment_gateway: hasApiKey ? 'unipay' : 'unipay'
      } as any);
      toast({ title: 'DuttyFy desconectado!' });
    } catch (error) {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' });
    }
  };

  const handleSetActiveGateway = async (gateway: string) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, active_payment_gateway: gateway } as any);
      toast({ title: `Gateway ativo: ${gateway === 'duttyfy' ? 'DuttyFy' : 'UniPay'}` });
    } catch (error) {
      toast({ title: 'Erro ao alterar gateway', variant: 'destructive' });
    }
  };

  const [isTestingPush, setIsTestingPush] = useState(false);

  const handleTogglePush = async () => {
    setIsPushLoading(true);
    try {
      if (pushSupport.subscribed) {
        const success = await unsubscribeFromPush(client.id);
        if (success) {
          setPushSupport(prev => ({ ...prev, subscribed: false }));
          toast({ title: 'Notificações desativadas' });
        }
      } else {
        const subscription = await subscribeToPush(client.id);
        if (subscription) {
          setPushSupport(prev => ({ ...prev, subscribed: true, permission: 'granted' }));
          await sendTestNotification();
          toast({ title: 'Notificações ativadas!', description: 'Você receberá uma notificação de teste.' });
        } else {
          toast({ 
            title: 'Não foi possível ativar', 
            description: 'Verifique as permissões do navegador.',
            variant: 'destructive' 
          });
        }
      }
    } catch (error) {
      console.error('Push toggle error:', error);
      toast({ title: 'Erro ao alterar notificações', variant: 'destructive' });
    } finally {
      setIsPushLoading(false);
      const status = await checkPushSupport();
      setPushSupport(status);
    }
  };

  const handleTestPushNotification = async () => {
    setIsTestingPush(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          clientId: client.id,
          type: 'sale',
          title: '🔔 Teste de Notificação',
          body: 'Se você está vendo isso, as notificações estão funcionando!',
        },
      });
      
      if (error) throw error;
      
      if (data?.sent > 0) {
        toast({ 
          title: 'Notificação enviada!', 
          description: `Enviada para ${data.sent} dispositivo(s). Verifique seu telefone.` 
        });
      } else {
        toast({ 
          title: 'Nenhum dispositivo encontrado', 
          description: data?.reason || 'Certifique-se de que as notificações estão ativas.',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Test push error:', error);
      toast({ title: 'Erro ao enviar teste', variant: 'destructive' });
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleRefreshSubscription = async () => {
    setIsPushLoading(true);
    try {
      // First unsubscribe
      await unsubscribeFromPush(client.id);
      // Then resubscribe
      const subscription = await subscribeToPush(client.id);
      if (subscription) {
        setPushSupport(prev => ({ ...prev, subscribed: true, permission: 'granted' }));
        toast({ title: 'Notificações reconfiguradas!', description: 'Subscription atualizada com sucesso.' });
      }
    } catch (error) {
      console.error('Refresh subscription error:', error);
      toast({ title: 'Erro ao reconfigurar', variant: 'destructive' });
    } finally {
      setIsPushLoading(false);
      const status = await checkPushSupport();
      setPushSupport(status);
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
  const hasDuttyfyKey = !!(settings as any).duttyfy_api_key;
  const duttyfyEnabled = (settings as any).duttyfy_enabled || false;
  const activeGateway = (settings as any).active_payment_gateway || 'unipay';

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seu plano, pagamentos e automações
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="plano" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden xs:inline" />
            <span>Plano</span>
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden xs:inline" />
            <span className="hidden sm:inline">Pagamentos</span>
            <span className="sm:hidden">Pagar</span>
          </TabsTrigger>
          <TabsTrigger value="automacoes" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden xs:inline" />
            <span className="hidden sm:inline">Automações</span>
            <span className="sm:hidden">Auto</span>
          </TabsTrigger>
          <TabsTrigger value="conta" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden xs:inline" />
            <span>Conta</span>
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
          {/* Active Gateway Selector */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Gateway Ativo
              </CardTitle>
              <CardDescription>
                Selecione qual gateway será usado para gerar pagamentos PIX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {[
                  { id: 'unipay', label: 'UniPay', connected: hasApiKey },
                  { id: 'duttyfy', label: 'DuttyFy', connected: hasDuttyfyKey },
                ].map(gw => (
                  <button
                    key={gw.id}
                    onClick={() => handleSetActiveGateway(gw.id)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      activeGateway === gw.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-muted/30 hover:border-primary/40'
                    }`}
                    disabled={!gw.connected}
                  >
                    <div className="text-center space-y-1">
                      <p className={`font-semibold ${activeGateway === gw.id ? 'text-primary' : 'text-foreground'}`}>
                        {gw.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {gw.connected ? (activeGateway === gw.id ? '✅ Ativo' : 'Conectado') : 'Não conectado'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* UniPay Card */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    UniPay
                  </CardTitle>
                  <CardDescription>
                    Integração com UniPay para pagamentos PIX
                  </CardDescription>
                </div>
                {hasApiKey && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Conectado</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasApiKey ? (
                <>
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
                      Acessar Painel
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
                <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
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
              )}
            </CardContent>
          </Card>

          {/* DuttyFy Card */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    DuttyFy
                  </CardTitle>
                  <CardDescription>
                    Integração com DuttyFy para pagamentos PIX
                  </CardDescription>
                </div>
                {hasDuttyfyKey && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Conectado</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasDuttyfyKey ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>DuttyFy Ativo</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber pagamentos PIX via DuttyFy
                      </p>
                    </div>
                    <Switch
                      checked={duttyfyEnabled}
                      onCheckedChange={handleToggleDuttyfy}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open('https://app.duttyfy.com.br/dashboard', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Acessar Painel
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDisconnectDuttyfy}
                    >
                      Desconectar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                  <div className="space-y-2">
                    <Label>Chave Secreta DuttyFy (x-client-secret)</Label>
                    <div className="relative">
                      <Input
                        type={showDuttyfyKey ? 'text' : 'password'}
                        placeholder="Cole sua chave secreta DuttyFy aqui"
                        value={duttyfyKey}
                        onChange={(e) => setDuttyfyKey(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowDuttyfyKey(!showDuttyfyKey)}
                      >
                        {showDuttyfyKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSaveDuttyfyKey} 
                    disabled={!duttyfyKey.trim()}
                    className="w-full"
                  >
                    Conectar DuttyFy
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="w-4 h-4" />
                    <a 
                      href="https://app.duttyfy.com.br" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Criar conta na DuttyFy
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Automações */}
        <TabsContent value="automacoes" className="space-y-6">
          {/* Push Notifications Card */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notificações de Venda
              </CardTitle>
              <CardDescription>
                Receba notificações no celular quando uma venda for confirmada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!pushSupport.supported ? (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">
                        Navegador não suportado
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Seu navegador não suporta notificações push. Use Chrome, Edge ou Firefox para ativar.
                      </p>
                    </div>
                  </div>
                </div>
              ) : pushSupport.permission === 'denied' ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <BellOff className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        Notificações bloqueadas
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        As notificações foram bloqueadas. Para ativar, clique no ícone de cadeado na barra de endereços e permita notificações.
                      </p>
                    </div>
                  </div>
                </div>
              ) : pushSupport.subscribed ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium text-green-600 dark:text-green-400">
                        Notificações ativas
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Você receberá notificações no celular quando uma venda for confirmada
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Ative as notificações push</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receba alertas instantâneos no seu celular sempre que uma venda for confirmada, mesmo com o app fechado.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    {pushSupport.subscribed ? (
                      <Bell className="w-4 h-4 text-green-500" />
                    ) : (
                      <BellOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    Notificações Push
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas de venda no dispositivo
                  </p>
                </div>
                <Button
                  variant={pushSupport.subscribed ? "outline" : "default"}
                  size="sm"
                  onClick={handleTogglePush}
                  disabled={!pushSupport.supported || pushSupport.permission === 'denied' || isPushLoading}
                >
                  {isPushLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : pushSupport.subscribed ? (
                    'Desativar'
                  ) : (
                    'Ativar'
                  )}
                </Button>
              </div>

              {pushSupport.subscribed && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestPushNotification}
                      disabled={isTestingPush}
                      className="flex-1"
                    >
                      {isTestingPush ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Bell className="w-4 h-4 mr-2" />
                      )}
                      Testar Push Real
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshSubscription}
                      disabled={isPushLoading}
                      title="Reconfigurar subscription"
                    >
                      <RotateCcw className={`w-4 h-4 ${isPushLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    O teste envia uma notificação push real para todos os dispositivos cadastrados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bot Automations Card */}
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
