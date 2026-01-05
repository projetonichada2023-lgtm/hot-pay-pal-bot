import { Client, useClientSettings, useUpdateClientSettings } from '@/hooks/useClient';
import { TikTokEventsHistory } from '@/components/settings/TikTokEventsHistory';
import { FacebookEventsHistory } from '@/components/settings/FacebookEventsHistory';
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
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [apiKey, setApiKey] = useState('');
  const { resetOnboarding, isResetting } = useOnboarding(client.id, client.onboarding_completed);
  const { usage } = usePlanLimits();
  
  // TikTok tracking state
  const [tiktokPixelCode, setTiktokPixelCode] = useState('');
  const [tiktokAccessToken, setTiktokAccessToken] = useState('');
  const [tiktokTestEventCode, setTiktokTestEventCode] = useState('');
  const [showTiktokToken, setShowTiktokToken] = useState(false);
  const [isTiktokTesting, setIsTiktokTesting] = useState(false);
  const [tiktokTestResult, setTiktokTestResult] = useState<any>(null);
  
  // Facebook tracking state
  const [facebookPixelId, setFacebookPixelId] = useState('');
  const [facebookAccessToken, setFacebookAccessToken] = useState('');
  const [facebookTestEventCode, setFacebookTestEventCode] = useState('');
  const [showFacebookToken, setShowFacebookToken] = useState(false);
  const [isFacebookTesting, setIsFacebookTesting] = useState(false);
  const [facebookTestResult, setFacebookTestResult] = useState<any>(null);
  
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

  const handleSaveTikTokConfig = async () => {
    if (!settings || (!tiktokPixelCode.trim() && !tiktokAccessToken.trim())) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        tiktok_pixel_code: tiktokPixelCode.trim() || (settings as any).tiktok_pixel_code,
        tiktok_access_token: tiktokAccessToken.trim() || (settings as any).tiktok_access_token,
        tiktok_tracking_enabled: true
      } as any);
      toast({ title: 'Configurações TikTok salvas!' });
      setTiktokPixelCode('');
      setTiktokAccessToken('');
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleToggleTikTokTracking = async (enabled: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, tiktok_tracking_enabled: enabled } as any);
      toast({ title: enabled ? 'Tracking TikTok ativado!' : 'Tracking TikTok desativado!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleDisconnectTikTok = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        tiktok_pixel_code: null,
        tiktok_access_token: null,
        tiktok_tracking_enabled: false
      } as any);
      toast({ title: 'TikTok desconectado!' });
    } catch (error) {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' });
    }
  };

  // Facebook handlers
  const handleSaveFacebookConfig = async () => {
    if (!settings || (!facebookPixelId.trim() && !facebookAccessToken.trim())) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        facebook_pixel_id: facebookPixelId.trim() || (settings as any).facebook_pixel_id,
        facebook_access_token: facebookAccessToken.trim() || (settings as any).facebook_access_token,
        facebook_tracking_enabled: true
      } as any);
      toast({ title: 'Configurações Facebook salvas!' });
      setFacebookPixelId('');
      setFacebookAccessToken('');
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleToggleFacebookTracking = async (enabled: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, facebook_tracking_enabled: enabled } as any);
      toast({ title: enabled ? 'Tracking Facebook ativado!' : 'Tracking Facebook desativado!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleDisconnectFacebook = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        facebook_pixel_id: null,
        facebook_access_token: null,
        facebook_tracking_enabled: false
      } as any);
      toast({ title: 'Facebook desconectado!' });
    } catch (error) {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' });
    }
  };

  const handleTestFacebookEvent = async () => {
    setIsFacebookTesting(true);
    setFacebookTestResult(null);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('test-facebook-event');
      
      if (error) {
        setFacebookTestResult({ success: false, error: error.message });
        toast({ title: 'Erro ao testar', description: error.message, variant: 'destructive' });
      } else {
        setFacebookTestResult(data);
        if (data.success) {
          toast({ title: 'Evento de teste enviado!', description: 'Verifique no Facebook Events Manager' });
        } else {
          toast({ 
            title: 'Facebook retornou erro', 
            description: data.error || 'Verifique as credenciais',
            variant: 'destructive' 
          });
        }
      }
    } catch (error: any) {
      setFacebookTestResult({ success: false, error: error.message });
      toast({ title: 'Erro ao testar', variant: 'destructive' });
    } finally {
      setIsFacebookTesting(false);
    }
  };

  const handleTestTikTokEvent = async () => {
    setIsTiktokTesting(true);
    setTiktokTestResult(null);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('test-tiktok-event');
      
      if (error) {
        setTiktokTestResult({ success: false, error: error.message });
        toast({ title: 'Erro ao testar', description: error.message, variant: 'destructive' });
      } else {
        setTiktokTestResult(data);
        if (data.success) {
          toast({ title: 'Evento de teste enviado!', description: 'Verifique no TikTok Events Manager' });
        } else {
          toast({ 
            title: 'TikTok retornou erro', 
            description: data.tiktok_response?.message || 'Verifique as credenciais',
            variant: 'destructive' 
          });
        }
      }
    } catch (error: any) {
      setTiktokTestResult({ success: false, error: error.message });
      toast({ title: 'Erro ao testar', variant: 'destructive' });
    } finally {
      setIsTiktokTesting(false);
    }
  };
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
      // Re-check status
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
  const hasTikTokConfig = !!(settings as any).tiktok_pixel_code && !!(settings as any).tiktok_access_token;
  const tiktokEnabled = (settings as any).tiktok_tracking_enabled || false;
  const hasFacebookConfig = !!(settings as any).facebook_pixel_id && !!(settings as any).facebook_access_token;
  const facebookEnabled = (settings as any).facebook_tracking_enabled || false;

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
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="plano" className="gap-2">
            <Crown className="w-4 h-4 hidden sm:inline" />
            Plano
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="gap-2">
            <CreditCard className="w-4 h-4 hidden sm:inline" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="tracking" className="gap-2">
            <BarChart3 className="w-4 h-4 hidden sm:inline" />
            Tracking
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

        {/* Tab: Tracking */}
        <TabsContent value="tracking" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    TikTok Ads
                  </CardTitle>
                  <CardDescription>
                    Rastreie conversões e cliques vindos do TikTok Ads
                  </CardDescription>
                </div>
                {hasTikTokConfig && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className={`w-2 h-2 rounded-full ${tiktokEnabled ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                    <span className="text-xs font-medium text-primary">TikTok</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasTikTokConfig ? (
                <>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-green-600 dark:text-green-400">
                          TikTok Pixel Conectado
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seu pixel está configurado para rastrear conversões
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Tracking Ativo</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar eventos para o TikTok Ads
                      </p>
                    </div>
                    <Switch
                      checked={tiktokEnabled}
                      onCheckedChange={handleToggleTikTokTracking}
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Deep Link para suas campanhas:</Label>
                      <code className="block mt-1 p-2 bg-background rounded text-sm break-all">
                        t.me/{client.telegram_bot_username}?start=tiktok_CAMPANHA
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Substitua <code>CAMPANHA</code> pelo nome da sua campanha. Para usar o ttclid, use:
                      <code className="block mt-1 p-1 bg-background rounded">
                        t.me/{client.telegram_bot_username}?start=ttclid_{'{{ttclid}}'}
                      </code>
                    </p>
                  </div>

                  {/* Test Event Code */}
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 space-y-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        Test Event Code (Modo Teste)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Deixe vazio para produção"
                          value={tiktokTestEventCode}
                          onChange={(e) => setTiktokTestEventCode(e.target.value)}
                          className="font-mono flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            if (!settings) return;
                            try {
                              await updateSettings.mutateAsync({ 
                                id: settings.id, 
                                tiktok_test_event_code: tiktokTestEventCode.trim() || null
                              } as any);
                              toast({ 
                                title: tiktokTestEventCode.trim() 
                                  ? 'Modo teste ativado!' 
                                  : 'Modo produção ativado!' 
                              });
                            } catch (error) {
                              toast({ title: 'Erro ao salvar', variant: 'destructive' });
                            }
                          }}
                        >
                          Salvar
                        </Button>
                      </div>
                      {(settings as any).tiktok_test_event_code && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            Modo teste ativo: <code className="font-mono">{(settings as any).tiktok_test_event_code}</code>
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="ml-auto h-6 text-xs text-destructive hover:text-destructive"
                            onClick={async () => {
                              if (!settings) return;
                              try {
                                await updateSettings.mutateAsync({ 
                                  id: settings.id, 
                                  tiktok_test_event_code: null
                                } as any);
                                setTiktokTestEventCode('');
                                toast({ title: 'Modo produção ativado!' });
                              } catch (error) {
                                toast({ title: 'Erro ao salvar', variant: 'destructive' });
                              }
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Para testar eventos, copie o código do TikTok Events Manager → Test Events.
                      </p>
                    </div>
                  </div>

                  {/* Test Event Button */}
                  <div className="space-y-3">
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={handleTestTikTokEvent}
                      disabled={isTiktokTesting}
                    >
                      {isTiktokTesting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando evento de teste...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Enviar Evento de Teste
                        </>
                      )}
                    </Button>

                    {tiktokTestResult && (
                      <div className={`p-4 rounded-lg border text-sm font-mono overflow-auto max-h-64 ${
                        tiktokTestResult.success 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-destructive/10 border-destructive/20'
                      }`}>
                        <p className={`font-bold mb-2 ${tiktokTestResult.success ? 'text-green-600' : 'text-destructive'}`}>
                          {tiktokTestResult.success ? '✅ Evento enviado com sucesso!' : '❌ Erro ao enviar evento'}
                        </p>
                        {(settings as any).tiktok_test_event_code && (
                          <p className="text-xs text-blue-500 mb-2">
                            📍 Enviado com Test Event Code: {(settings as any).tiktok_test_event_code}
                          </p>
                        )}
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(tiktokTestResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open('https://ads.tiktok.com/marketing_api/docs?id=1739584855420929', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Documentação
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDisconnectTikTok}
                    >
                      Desconectar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      Conecte seu TikTok Pixel para rastrear cliques e conversões vindos dos seus anúncios.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pixel Code</Label>
                        <Input
                          type="text"
                          placeholder="Ex: CXXXXXXXXXXXXXXXX"
                          value={tiktokPixelCode}
                          onChange={(e) => setTiktokPixelCode(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Encontre em TikTok Ads Manager → Assets → Events → Web Events
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Access Token</Label>
                        <div className="relative">
                          <Input
                            type={showTiktokToken ? 'text' : 'password'}
                            placeholder="Cole seu access token aqui"
                            value={tiktokAccessToken}
                            onChange={(e) => setTiktokAccessToken(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowTiktokToken(!showTiktokToken)}
                          >
                            {showTiktokToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Gere em TikTok Ads Manager → Assets → Events → Settings → Generate Access Token
                        </p>
                      </div>

                      <Button 
                        onClick={handleSaveTikTokConfig} 
                        disabled={!tiktokPixelCode.trim() || !tiktokAccessToken.trim()}
                        className="w-full"
                      >
                        Conectar TikTok Pixel
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="w-4 h-4" />
                    <span>Como configurar?</span>
                    <a 
                      href="https://ads.tiktok.com/help/article?aid=10028346" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver guia do TikTok
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* TikTok Events History */}
          {hasTikTokConfig && (
            <TikTokEventsHistory clientId={client.id} />
          )}

          {/* Facebook Ads Card */}
          <Card className="glass-card border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook Ads
                  </CardTitle>
                  <CardDescription>
                    Rastreie conversões e cliques vindos do Facebook/Instagram Ads
                  </CardDescription>
                </div>
                {hasFacebookConfig && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <div className={`w-2 h-2 rounded-full ${facebookEnabled ? 'bg-blue-500 animate-pulse' : 'bg-muted'}`} />
                    <span className="text-xs font-medium text-blue-500">Facebook</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasFacebookConfig ? (
                <>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          Facebook Pixel Conectado
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seu pixel está configurado para rastrear conversões
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Tracking Ativo</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar eventos para o Facebook Ads
                      </p>
                    </div>
                    <Switch
                      checked={facebookEnabled}
                      onCheckedChange={handleToggleFacebookTracking}
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Deep Link para suas campanhas:</Label>
                      <code className="block mt-1 p-2 bg-background rounded text-sm break-all">
                        t.me/{client.telegram_bot_username}?start=fb_CAMPANHA
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Substitua <code>CAMPANHA</code> pelo nome da sua campanha.
                    </p>
                  </div>

                  {/* Test Event Code */}
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 space-y-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        Test Event Code (Modo Teste)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Deixe vazio para produção"
                          value={facebookTestEventCode}
                          onChange={(e) => setFacebookTestEventCode(e.target.value)}
                          className="font-mono flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            if (!settings) return;
                            try {
                              await updateSettings.mutateAsync({ 
                                id: settings.id, 
                                facebook_test_event_code: facebookTestEventCode.trim() || null
                              } as any);
                              toast({ 
                                title: facebookTestEventCode.trim() 
                                  ? 'Modo teste ativado!' 
                                  : 'Modo produção ativado!' 
                              });
                            } catch (error) {
                              toast({ title: 'Erro ao salvar', variant: 'destructive' });
                            }
                          }}
                        >
                          Salvar
                        </Button>
                      </div>
                      {(settings as any).facebook_test_event_code && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            Modo teste ativo: <code className="font-mono">{(settings as any).facebook_test_event_code}</code>
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="ml-auto h-6 text-xs text-destructive hover:text-destructive"
                            onClick={async () => {
                              if (!settings) return;
                              try {
                                await updateSettings.mutateAsync({ 
                                  id: settings.id, 
                                  facebook_test_event_code: null
                                } as any);
                                setFacebookTestEventCode('');
                                toast({ title: 'Modo produção ativado!' });
                              } catch (error) {
                                toast({ title: 'Erro ao salvar', variant: 'destructive' });
                              }
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Para testar eventos, copie o código do Facebook Events Manager → Test Events.
                      </p>
                    </div>
                  </div>

                  {/* Test Event Button */}
                  <div className="space-y-3">
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={handleTestFacebookEvent}
                      disabled={isFacebookTesting}
                    >
                      {isFacebookTesting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando evento de teste...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Enviar Evento de Teste
                        </>
                      )}
                    </Button>

                    {facebookTestResult && (
                      <div className={`p-4 rounded-lg border text-sm font-mono overflow-auto max-h-64 ${
                        facebookTestResult.success 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-destructive/10 border-destructive/20'
                      }`}>
                        <p className={`font-bold mb-2 ${facebookTestResult.success ? 'text-green-600' : 'text-destructive'}`}>
                          {facebookTestResult.success ? '✅ Evento enviado com sucesso!' : '❌ Erro ao enviar evento'}
                        </p>
                        {(settings as any).facebook_test_event_code && (
                          <p className="text-xs text-blue-500 mb-2">
                            📍 Enviado com Test Event Code: {(settings as any).facebook_test_event_code}
                          </p>
                        )}
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(facebookTestResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open('https://www.facebook.com/events_manager', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Acessar Events Manager
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDisconnectFacebook}
                    >
                      Desconectar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      Conecte seu Facebook Pixel para rastrear cliques e conversões vindos dos seus anúncios do Facebook e Instagram.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pixel ID</Label>
                        <Input
                          type="text"
                          placeholder="Ex: 1234567890123456"
                          value={facebookPixelId}
                          onChange={(e) => setFacebookPixelId(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Encontre em Facebook Events Manager → Data Sources → Seu Pixel
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Access Token</Label>
                        <div className="relative">
                          <Input
                            type={showFacebookToken ? 'text' : 'password'}
                            placeholder="Cole seu access token aqui"
                            value={facebookAccessToken}
                            onChange={(e) => setFacebookAccessToken(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowFacebookToken(!showFacebookToken)}
                          >
                            {showFacebookToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Gere em Facebook Events Manager → Settings → Generate Access Token
                        </p>
                      </div>

                      <Button 
                        onClick={handleSaveFacebookConfig} 
                        disabled={!facebookPixelId.trim() || !facebookAccessToken.trim()}
                        className="w-full"
                      >
                        Conectar Facebook Pixel
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="w-4 h-4" />
                    <span>Como configurar?</span>
                    <a 
                      href="https://www.facebook.com/business/help/952192354843755" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver guia do Facebook
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Facebook Events History */}
          {hasFacebookConfig && (
            <FacebookEventsHistory clientId={client.id} />
          )}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sendTestNotification}
                  className="w-full"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enviar notificação de teste
                </Button>
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
