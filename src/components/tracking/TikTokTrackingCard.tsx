import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Eye, EyeOff, ExternalLink, CheckCircle2, Zap, AlertCircle, BarChart3 
} from 'lucide-react';
import { TrackingTestResult } from '@/hooks/useTrackingSettings';

interface TikTokTrackingCardProps {
  botUsername: string | null;
  hasTikTokConfig: boolean;
  tiktokEnabled: boolean;
  settings: {
    tiktok_test_event_code?: string | null;
  } | undefined;
  // Form state
  tiktokPixelCode: string;
  setTiktokPixelCode: (value: string) => void;
  tiktokAccessToken: string;
  setTiktokAccessToken: (value: string) => void;
  tiktokTestEventCode: string;
  setTiktokTestEventCode: (value: string) => void;
  showTiktokToken: boolean;
  setShowTiktokToken: (value: boolean) => void;
  isTiktokTesting: boolean;
  tiktokTestResult: TrackingTestResult | null;
  // Handlers
  handleSaveTikTokConfig: () => void;
  handleToggleTikTokTracking: (enabled: boolean) => void;
  handleDisconnectTikTok: () => void;
  handleSaveTikTokTestCode: () => void;
  handleRemoveTikTokTestCode: () => void;
  handleTestTikTokEvent: () => void;
}

export const TikTokTrackingCard = ({
  botUsername,
  hasTikTokConfig,
  tiktokEnabled,
  settings,
  tiktokPixelCode,
  setTiktokPixelCode,
  tiktokAccessToken,
  setTiktokAccessToken,
  tiktokTestEventCode,
  setTiktokTestEventCode,
  showTiktokToken,
  setShowTiktokToken,
  isTiktokTesting,
  tiktokTestResult,
  handleSaveTikTokConfig,
  handleToggleTikTokTracking,
  handleDisconnectTikTok,
  handleSaveTikTokTestCode,
  handleRemoveTikTokTestCode,
  handleTestTikTokEvent,
}: TikTokTrackingCardProps) => {
  return (
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
              <Switch checked={tiktokEnabled} onCheckedChange={handleToggleTikTokTracking} />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Deep Link para suas campanhas:</Label>
                <code className="block mt-1 p-2 bg-background rounded text-sm break-all">
                  t.me/{botUsername}?start=tiktok_CAMPANHA
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Substitua <code>CAMPANHA</code> pelo nome da sua campanha. Para usar o ttclid, use:
                <code className="block mt-1 p-1 bg-background rounded">
                  t.me/{botUsername}?start=ttclid_{'{{ttclid}}'}
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
                  <Button variant="outline" size="sm" onClick={handleSaveTikTokTestCode}>
                    Salvar
                  </Button>
                </div>
                {settings?.tiktok_test_event_code && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Modo teste ativo: <code className="font-mono">{settings.tiktok_test_event_code}</code>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 text-xs text-destructive hover:text-destructive"
                      onClick={handleRemoveTikTokTestCode}
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
                <div
                  className={`p-4 rounded-lg border text-sm font-mono overflow-auto max-h-64 ${
                    tiktokTestResult.success
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-destructive/10 border-destructive/20'
                  }`}
                >
                  <p className={`font-bold mb-2 ${tiktokTestResult.success ? 'text-green-600' : 'text-destructive'}`}>
                    {tiktokTestResult.success ? '✅ Evento enviado com sucesso!' : '❌ Erro ao enviar evento'}
                  </p>
                  {settings?.tiktok_test_event_code && (
                    <p className="text-xs text-blue-500 mb-2">
                      📍 Enviado com Test Event Code: {settings.tiktok_test_event_code}
                    </p>
                  )}
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(tiktokTestResult, null, 2)}</pre>
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
              <Button variant="destructive" size="sm" onClick={handleDisconnectTikTok}>
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
  );
};
