import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, ExternalLink, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { TrackingTestResult } from '@/hooks/useTrackingSettings';

interface FacebookTrackingCardProps {
  botUsername: string | null;
  hasFacebookConfig: boolean;
  facebookEnabled: boolean;
  settings: {
    facebook_test_event_code?: string | null;
  } | undefined;
  // Form state
  facebookPixelId: string;
  setFacebookPixelId: (value: string) => void;
  facebookAccessToken: string;
  setFacebookAccessToken: (value: string) => void;
  facebookTestEventCode: string;
  setFacebookTestEventCode: (value: string) => void;
  showFacebookToken: boolean;
  setShowFacebookToken: (value: boolean) => void;
  isFacebookTesting: boolean;
  facebookTestResult: TrackingTestResult | null;
  // Handlers
  handleSaveFacebookConfig: () => void;
  handleToggleFacebookTracking: (enabled: boolean) => void;
  handleDisconnectFacebook: () => void;
  handleSaveFacebookTestCode: () => void;
  handleRemoveFacebookTestCode: () => void;
  handleTestFacebookEvent: () => void;
}

export const FacebookTrackingCard = ({
  botUsername,
  hasFacebookConfig,
  facebookEnabled,
  settings,
  facebookPixelId,
  setFacebookPixelId,
  facebookAccessToken,
  setFacebookAccessToken,
  facebookTestEventCode,
  setFacebookTestEventCode,
  showFacebookToken,
  setShowFacebookToken,
  isFacebookTesting,
  facebookTestResult,
  handleSaveFacebookConfig,
  handleToggleFacebookTracking,
  handleDisconnectFacebook,
  handleSaveFacebookTestCode,
  handleRemoveFacebookTestCode,
  handleTestFacebookEvent,
}: FacebookTrackingCardProps) => {
  return (
    <Card className="glass-card border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
              <Switch checked={facebookEnabled} onCheckedChange={handleToggleFacebookTracking} />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Deep Link para suas campanhas:</Label>
                <code className="block mt-1 p-2 bg-background rounded text-sm break-all">
                  t.me/{botUsername}?start=fb_CAMPANHA
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
                  <Button variant="outline" size="sm" onClick={handleSaveFacebookTestCode}>
                    Salvar
                  </Button>
                </div>
                {settings?.facebook_test_event_code && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Modo teste ativo: <code className="font-mono">{settings.facebook_test_event_code}</code>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 text-xs text-destructive hover:text-destructive"
                      onClick={handleRemoveFacebookTestCode}
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
                <div
                  className={`p-4 rounded-lg border text-sm font-mono overflow-auto max-h-64 ${
                    facebookTestResult.success
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-destructive/10 border-destructive/20'
                  }`}
                >
                  <p className={`font-bold mb-2 ${facebookTestResult.success ? 'text-green-600' : 'text-destructive'}`}>
                    {facebookTestResult.success ? '✅ Evento enviado com sucesso!' : '❌ Erro ao enviar evento'}
                  </p>
                  {settings?.facebook_test_event_code && (
                    <p className="text-xs text-blue-500 mb-2">
                      📍 Enviado com Test Event Code: {settings.facebook_test_event_code}
                    </p>
                  )}
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(facebookTestResult, null, 2)}</pre>
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
              <Button variant="destructive" size="sm" onClick={handleDisconnectFacebook}>
                Desconectar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Conecte seu Facebook Pixel para rastrear cliques e conversões vindos dos seus anúncios do Facebook e
                Instagram.
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
  );
};
