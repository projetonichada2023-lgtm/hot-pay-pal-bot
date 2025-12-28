import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Smartphone, 
  Download, 
  Share, 
  Plus, 
  CheckCircle2, 
  ArrowRight,
  Apple,
  Chrome,
  MonitorSmartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallApp() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Install error:', error);
    } finally {
      setIsInstalling(false);
      setInstallPrompt(null);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">App Instalado!</CardTitle>
            <CardDescription>
              O TeleGateway já está instalado no seu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Abrir Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Instalar TeleGateway
          </h1>
          <p className="text-muted-foreground text-lg">
            Receba notificações de venda e acesse o painel rapidamente
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Por que instalar?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'Notificações push de novas vendas',
                'Acesso rápido pela tela inicial',
                'Funciona offline',
                'Experiência de app nativo',
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Platform-specific instructions */}
        {platform === 'ios' && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Apple className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>iPhone / iPad</CardTitle>
                  <CardDescription>Instruções para iOS</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  ⚠️ Importante: Use o Safari para instalar. Chrome e outros navegadores não suportam instalação no iOS.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Abra no Safari</p>
                    <p className="text-sm text-muted-foreground">
                      Copie este link e cole no Safari se estiver em outro navegador
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      Toque em Compartilhar
                      <Share className="w-4 h-4" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      O ícone de quadrado com seta na barra inferior
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      Adicionar à Tela de Início
                      <Plus className="w-4 h-4" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Role para baixo e toque nessa opção
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Confirme a instalação</p>
                    <p className="text-sm text-muted-foreground">
                      Toque em "Adicionar" no canto superior direito
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      Pronto!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Abra o app pela tela inicial e ative as notificações em Configurações
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/install');
                }}
              >
                Copiar link para Safari
              </Button>
            </CardContent>
          </Card>
        )}

        {platform === 'android' && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Android</CardTitle>
                  <CardDescription>Instalação rápida</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {installPrompt ? (
                <Button 
                  onClick={handleInstall} 
                  className="w-full h-14 text-lg"
                  disabled={isInstalling}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isInstalling ? 'Instalando...' : 'Instalar App'}
                </Button>
              ) : (
                <>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Se o botão de instalação não aparecer, siga os passos abaixo:
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Abra o menu do navegador</p>
                        <p className="text-sm text-muted-foreground">
                          Toque nos 3 pontos no canto superior direito
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">"Instalar aplicativo" ou "Adicionar à tela inicial"</p>
                        <p className="text-sm text-muted-foreground">
                          Procure uma dessas opções no menu
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          Pronto!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          O app aparecerá na sua tela inicial
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {platform === 'desktop' && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <MonitorSmartphone className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Desktop</CardTitle>
                  <CardDescription>Chrome, Edge ou outros navegadores</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {installPrompt ? (
                <Button 
                  onClick={handleInstall} 
                  className="w-full h-14 text-lg"
                  disabled={isInstalling}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isInstalling ? 'Instalando...' : 'Instalar App'}
                </Button>
              ) : (
                <>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Clique no ícone de instalação na barra de endereços do navegador
                    </p>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                    <Chrome className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">Chrome / Edge</p>
                      <p className="text-sm text-muted-foreground">
                        Procure o ícone de "+" ou computador na barra de endereços
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back button */}
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
