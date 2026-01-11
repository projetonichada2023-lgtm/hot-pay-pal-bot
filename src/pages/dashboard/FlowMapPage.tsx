import { useState, useCallback } from 'react';
import { Client } from '@/hooks/useClient';
import { useBotMessages, BotMessage, useUpdateBotMessage } from '@/hooks/useBotMessages';
import { useCartRecovery } from '@/hooks/useCartRecovery';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Map, 
  Settings2,
  Check,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FlowNode } from '@/components/flow-map/FlowNode';
import { FlowConnector } from '@/components/flow-map/FlowConnector';
import { FlowConfigPanel } from '@/components/flow-map/FlowConfigPanel';

interface FlowMapPageProps {
  client: Client;
}

// Define the flow structure
const flowSteps = [
  {
    id: 'welcome',
    label: 'Boas-vindas',
    icon: '👋',
    description: 'Cliente inicia conversa',
    position: { x: 0, y: 0 },
    category: 'start',
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    icon: '📦',
    description: 'Exibe produtos disponíveis',
    position: { x: 1, y: 0 },
    category: 'sales',
  },
  {
    id: 'product_detail',
    label: 'Detalhe do Produto',
    icon: '🏷️',
    description: 'Cliente seleciona produto',
    position: { x: 2, y: 0 },
    category: 'sales',
  },
  {
    id: 'order_created',
    label: 'Pedido Criado',
    icon: '🛒',
    description: 'Pedido registrado',
    position: { x: 3, y: 0 },
    category: 'order',
  },
  {
    id: 'pix_generated',
    label: 'PIX Gerado',
    icon: '💳',
    description: 'Código de pagamento',
    position: { x: 4, y: 0 },
    category: 'payment',
  },
  {
    id: 'payment_confirmed',
    label: 'Pagamento Confirmado',
    icon: '✅',
    description: 'Pagamento aprovado',
    position: { x: 5, y: 0 },
    category: 'payment',
  },
  {
    id: 'upsell',
    label: 'Upsell',
    icon: '🔥',
    description: 'Oferta adicional',
    position: { x: 5, y: 1 },
    category: 'marketing',
    optional: true,
  },
  {
    id: 'downsell',
    label: 'Downsell',
    icon: '💡',
    description: 'Oferta alternativa',
    position: { x: 5, y: 2 },
    category: 'marketing',
    optional: true,
  },
  {
    id: 'delivery',
    label: 'Entrega',
    icon: '📦',
    description: 'Acesso ao produto',
    position: { x: 6, y: 0 },
    category: 'delivery',
  },
  {
    id: 'thank_you',
    label: 'Agradecimento',
    icon: '❤️',
    description: 'Mensagem de pós-venda',
    position: { x: 7, y: 0 },
    category: 'end',
  },
  {
    id: 'cart_reminder',
    label: 'Recuperação',
    icon: '⏰',
    description: 'Carrinho abandonado',
    position: { x: 4, y: 2 },
    category: 'recovery',
    optional: true,
  },
  {
    id: 'order_cancelled',
    label: 'Cancelamento',
    icon: '❌',
    description: 'Pedido cancelado',
    position: { x: 3, y: 2 },
    category: 'order',
    optional: true,
  },
];

// Define connections between nodes
const flowConnections = [
  { from: 'welcome', to: 'catalog' },
  { from: 'catalog', to: 'product_detail' },
  { from: 'product_detail', to: 'order_created' },
  { from: 'order_created', to: 'pix_generated' },
  { from: 'pix_generated', to: 'payment_confirmed', label: 'Pago' },
  { from: 'pix_generated', to: 'cart_reminder', label: 'Não pagou', dashed: true },
  { from: 'cart_reminder', to: 'pix_generated', label: 'Retorno', dashed: true },
  { from: 'payment_confirmed', to: 'upsell', label: 'Upsell ativo', dashed: true },
  { from: 'upsell', to: 'downsell', label: 'Recusou', dashed: true },
  { from: 'payment_confirmed', to: 'delivery' },
  { from: 'upsell', to: 'delivery', label: 'Aceito' },
  { from: 'downsell', to: 'delivery', label: 'Aceito' },
  { from: 'delivery', to: 'thank_you' },
  { from: 'order_created', to: 'order_cancelled', label: 'Cancelado', dashed: true },
];

const categoryColors: Record<string, string> = {
  start: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/50',
  sales: 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
  order: 'from-amber-500/20 to-amber-600/10 border-amber-500/50',
  payment: 'from-violet-500/20 to-violet-600/10 border-violet-500/50',
  marketing: 'from-pink-500/20 to-pink-600/10 border-pink-500/50',
  delivery: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/50',
  end: 'from-green-500/20 to-green-600/10 border-green-500/50',
  recovery: 'from-orange-500/20 to-orange-600/10 border-orange-500/50',
};

export const FlowMapPage = ({ client }: FlowMapPageProps) => {
  const { data: messages, isLoading } = useBotMessages(client.id);
  const { messages: recoveryMessages } = useCartRecovery(client.id);
  const updateMessage = useUpdateBotMessage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Group messages by type
  const groupedMessages = messages?.reduce((acc, msg) => {
    if (!acc[msg.message_type]) {
      acc[msg.message_type] = [];
    }
    acc[msg.message_type].push(msg);
    return acc;
  }, {} as Record<string, BotMessage[]>) || {};

  const getNodeStatus = useCallback((stepId: string) => {
    if (stepId === 'cart_reminder') {
      const hasRecovery = recoveryMessages && recoveryMessages.length > 0;
      const activeRecovery = recoveryMessages?.some(m => m.is_active);
      if (!hasRecovery) return 'empty';
      return activeRecovery ? 'configured' : 'inactive';
    }
    
    const nodeMessages = groupedMessages[stepId] || [];
    if (nodeMessages.length === 0) return 'empty';
    const hasActive = nodeMessages.some(m => m.is_active);
    return hasActive ? 'configured' : 'inactive';
  }, [groupedMessages, recoveryMessages]);

  const handleNodeClick = (stepId: string) => {
    setSelectedNode(stepId);
    setShowConfigPanel(true);
  };

  const handleClosePanel = () => {
    setShowConfigPanel(false);
    setSelectedNode(null);
  };

  const handleGoToMessages = () => {
    navigate('/dashboard/messages');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando fluxo...</p>
        </div>
      </div>
    );
  }

  // Stats
  const configuredSteps = flowSteps.filter(s => getNodeStatus(s.id) === 'configured').length;
  const totalSteps = flowSteps.filter(s => !s.optional).length;
  const completionPercent = Math.round((configuredSteps / totalSteps) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shadow-lg shadow-primary/10">
              <Map className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mapa do Fluxo</h1>
              <p className="text-muted-foreground mt-1">
                Visualize e configure cada etapa da jornada do cliente
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary" className="font-normal">
                  <Check className="w-3 h-3 mr-1.5" />
                  {configuredSteps}/{totalSteps} etapas configuradas
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-normal",
                    completionPercent === 100 
                      ? "text-emerald-400 border-emerald-400/30" 
                      : "text-amber-400 border-amber-400/30"
                  )}
                >
                  {completionPercent}% completo
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/simulator')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Testar Fluxo
            </Button>
            <Button onClick={handleGoToMessages}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Editar Mensagens
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-secondary/30 rounded-xl">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Configurado</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Inativo</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          <span className="text-muted-foreground">Não configurado</span>
        </div>
        <div className="flex items-center gap-2 text-sm ml-auto">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Fluxo principal</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-0.5 border-t-2 border-dashed border-muted-foreground/50" />
          <span className="text-muted-foreground">Fluxo opcional</span>
        </div>
      </div>

      {/* Flow Map */}
      <div className="relative bg-secondary/20 rounded-2xl border border-border/50 p-8 overflow-x-auto">
        <div className="min-w-[1200px] min-h-[500px] relative">
          {/* Render Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {flowConnections.map((conn, idx) => {
              const fromNode = flowSteps.find(s => s.id === conn.from);
              const toNode = flowSteps.find(s => s.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              return (
                <FlowConnector
                  key={idx}
                  from={fromNode.position}
                  to={toNode.position}
                  label={conn.label}
                  dashed={conn.dashed}
                />
              );
            })}
          </svg>

          {/* Render Nodes */}
          {flowSteps.map((step) => (
            <FlowNode
              key={step.id}
              step={step}
              status={getNodeStatus(step.id)}
              isSelected={selectedNode === step.id}
              categoryColor={categoryColors[step.category]}
              messageCount={groupedMessages[step.id]?.length || 0}
              onClick={() => handleNodeClick(step.id)}
            />
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="font-medium">Etapas Essenciais</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure pelo menos: Boas-vindas, Catálogo, PIX Gerado e Entrega
          </p>
        </div>
        
        <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="font-medium">Recuperação</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ative mensagens de recuperação para aumentar suas vendas
          </p>
        </div>
        
        <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <Settings2 className="w-4 h-4 text-pink-500" />
            </div>
            <span className="font-medium">Upsell & Downsell</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure ofertas adicionais para aumentar o ticket médio
          </p>
        </div>
      </div>

      {/* Config Panel */}
      {showConfigPanel && selectedNode && (
        <FlowConfigPanel
          stepId={selectedNode}
          stepConfig={flowSteps.find(s => s.id === selectedNode)!}
          messages={groupedMessages[selectedNode] || []}
          recoveryMessages={selectedNode === 'cart_reminder' ? recoveryMessages : undefined}
          onClose={handleClosePanel}
          onNavigateToMessages={() => {
            handleClosePanel();
            navigate('/dashboard/messages');
          }}
          onNavigateToRecovery={() => {
            handleClosePanel();
            navigate('/dashboard/recovery');
          }}
        />
      )}
    </div>
  );
};
