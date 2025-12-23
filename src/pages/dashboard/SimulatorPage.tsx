import { Client } from '@/hooks/useClient';
import { BotSimulator } from '@/components/bot-simulator/BotSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Smartphone, 
  MessageSquare, 
  ShoppingCart, 
  CreditCard, 
  Package, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useBotMessages } from '@/hooks/useBotMessages';
import { useProducts } from '@/hooks/useProducts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SimulatorPageProps {
  client: Client;
}

export const SimulatorPage = ({ client }: SimulatorPageProps) => {
  const { data: messages = [] } = useBotMessages(client.id);
  const { data: products = [] } = useProducts(client.id);
  const navigate = useNavigate();

  const messageTypes = [
    { type: 'welcome', label: 'Boas-vindas', icon: MessageSquare },
    { type: 'catalog', label: 'Catálogo', icon: ShoppingCart },
    { type: 'product_detail', label: 'Detalhe do Produto', icon: Package },
    { type: 'pix_generated', label: 'PIX Gerado', icon: CreditCard },
    { type: 'payment_confirmed', label: 'Pagamento Confirmado', icon: CheckCircle },
    { type: 'delivery', label: 'Entrega', icon: Package },
    { type: 'thank_you', label: 'Agradecimento', icon: CheckCircle },
  ];

  const configuredMessages = messageTypes.filter(mt => 
    messages.some(m => m.message_type === mt.type && m.is_active)
  );

  const missingMessages = messageTypes.filter(mt => 
    !messages.some(m => m.message_type === mt.type && m.is_active)
  );

  const hasProducts = products.length > 0;
  const hasMinimumMessages = configuredMessages.length >= 3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-primary" />
          Simulador do Bot
        </h1>
        <p className="text-muted-foreground">
          Teste o fluxo completo de vendas antes de publicar
        </p>
      </div>

      {/* Status alerts */}
      {(!hasProducts || !hasMinimumMessages) && (
        <div className="space-y-3">
          {!hasProducts && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Nenhum produto cadastrado</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Cadastre pelo menos um produto para testar o fluxo de vendas.</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/dashboard/products')}
                >
                  Cadastrar Produto
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {!hasMinimumMessages && (
            <Alert className="border-warning/50 bg-warning/10">
              <Info className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">Mensagens não configuradas</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Configure as mensagens do bot para uma simulação mais realista.</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/dashboard/messages')}
                >
                  Configurar Mensagens
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator */}
        <div className="lg:col-span-2">
          <BotSimulator clientId={client.id} />
        </div>

        {/* Status sidebar */}
        <div className="space-y-4">
          {/* Flow status */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status do Fluxo</CardTitle>
              <CardDescription className="text-xs">
                Mensagens configuradas para cada etapa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {messageTypes.map((mt) => {
                const isConfigured = configuredMessages.some(cm => cm.type === mt.type);
                const Icon = mt.icon;
                return (
                  <div 
                    key={mt.type}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                      isConfigured 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{mt.label}</span>
                    {isConfigured ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Produtos Disponíveis</CardTitle>
              <CardDescription className="text-xs">
                {products.length} produto(s) para teste
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="space-y-2">
                  {products.slice(0, 5).map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                    >
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhum produto cadastrado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">💡 Dicas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Use as "Ações Rápidas" para navegar pelo fluxo</li>
                <li>• Digite comandos como um cliente real</li>
                <li>• Teste diferentes produtos e cenários</li>
                <li>• Verifique se as mensagens fazem sentido</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
