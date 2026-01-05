import { useState, useEffect } from 'react';
import { Client, useClientSettings, useUpdateClientSettings } from '@/hooks/useClient';
import { TikTokEventsHistory } from '@/components/settings/TikTokEventsHistory';
import { FacebookEventsHistory } from '@/components/settings/FacebookEventsHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle2, 
  Zap,
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface TrackingPageProps {
  client: Client;
}

export const TrackingPage = ({ client }: TrackingPageProps) => {
  const { data: settings, isLoading } = useClientSettings(client.id);
  const updateSettings = useUpdateClientSettings();
  const { toast } = useToast();
  
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

  // TikTok handlers
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return null;

  const hasTikTokConfig = !!(settings as any).tiktok_pixel_code && !!(settings as any).tiktok_access_token;
  const tiktokEnabled = (settings as any).tiktok_tracking_enabled || false;
  const hasFacebookConfig = !!(settings as any).facebook_pixel_id && !!(settings as any).facebook_access_token;
  const facebookEnabled = (settings as any).facebook_tracking_enabled || false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Tracking & Conversões
        </h1>
        <p className="text-muted-foreground">
          Configure o rastreamento de conversões do TikTok e Facebook Ads
        </p>
      </div>

      {/* TikTok Ads Card */}
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
    </div>
  );
};
