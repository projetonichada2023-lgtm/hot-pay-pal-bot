import { useMemo } from 'react';
import { 
  ArrowDown, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Circle,
  Users,
  ShoppingCart,
  CreditCard,
  Package,
  Heart,
  RotateCcw,
  TrendingUp,
  MessageCircle,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BotMessage } from '@/hooks/useBotMessages';
import { motion } from 'framer-motion';

interface FlowNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  messageType: string;
  isConfigured: boolean;
  messageCount: number;
  isActive: boolean;
  isOptional?: boolean;
  branch?: 'success' | 'failure' | 'optional';
}

interface MessageFlowDiagramProps {
  messages: BotMessage[];
  onNodeClick: (messageType: string) => void;
  onClose: () => void;
}

export const MessageFlowDiagram = ({ messages, onNodeClick, onClose }: MessageFlowDiagramProps) => {
  const groupedMessages = useMemo(() => {
    return messages.reduce((acc, msg) => {
      if (!acc[msg.message_type]) {
        acc[msg.message_type] = [];
      }
      acc[msg.message_type].push(msg);
      return acc;
    }, {} as Record<string, BotMessage[]>);
  }, [messages]);

  const getNodeStatus = (type: string) => {
    const msgs = groupedMessages[type] || [];
    return {
      isConfigured: msgs.length > 0,
      messageCount: msgs.length,
      isActive: msgs.some(m => m.is_active),
    };
  };

  // Define the main sales flow
  const mainFlow: FlowNode[] = [
    {
      id: 'welcome',
      label: 'Boas-vindas',
      icon: <Users className="w-5 h-5" />,
      description: 'Cliente inicia conversa',
      messageType: 'welcome',
      ...getNodeStatus('welcome'),
    },
    {
      id: 'catalog',
      label: 'Catálogo',
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'Mostra produtos',
      messageType: 'catalog',
      ...getNodeStatus('catalog'),
    },
    {
      id: 'product_detail',
      label: 'Detalhe',
      icon: <Package className="w-5 h-5" />,
      description: 'Info do produto',
      messageType: 'product_detail',
      ...getNodeStatus('product_detail'),
    },
    {
      id: 'pix_generated',
      label: 'PIX',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Pagamento gerado',
      messageType: 'pix_generated',
      ...getNodeStatus('pix_generated'),
    },
    {
      id: 'payment_confirmed',
      label: 'Confirmado',
      icon: <CheckCircle2 className="w-5 h-5" />,
      description: 'Pagamento OK',
      messageType: 'payment_confirmed',
      ...getNodeStatus('payment_confirmed'),
      branch: 'success',
    },
    {
      id: 'delivery',
      label: 'Entrega',
      icon: <Package className="w-5 h-5" />,
      description: 'Envio do produto',
      messageType: 'delivery',
      ...getNodeStatus('delivery'),
    },
    {
      id: 'thank_you',
      label: 'Obrigado',
      icon: <Heart className="w-5 h-5" />,
      description: 'Pós-venda',
      messageType: 'thank_you',
      ...getNodeStatus('thank_you'),
    },
  ];

  // Side branches
  const recoveryBranch: FlowNode[] = [
    {
      id: 'cart_reminder',
      label: 'Recuperação',
      icon: <RotateCcw className="w-5 h-5" />,
      description: 'Carrinho abandonado',
      messageType: 'cart_reminder',
      ...getNodeStatus('cart_reminder'),
      isOptional: true,
      branch: 'failure',
    },
  ];

  const upsellBranch: FlowNode[] = [
    {
      id: 'upsell',
      label: 'Upsell',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Oferta adicional',
      messageType: 'upsell',
      ...getNodeStatus('upsell'),
      isOptional: true,
      branch: 'optional',
    },
    {
      id: 'downsell',
      label: 'Downsell',
      icon: <MessageCircle className="w-5 h-5" />,
      description: 'Oferta alternativa',
      messageType: 'downsell',
      ...getNodeStatus('downsell'),
      isOptional: true,
      branch: 'optional',
    },
  ];

  const cancelBranch: FlowNode[] = [
    {
      id: 'order_cancelled',
      label: 'Cancelado',
      icon: <X className="w-5 h-5" />,
      description: 'Pedido cancelado',
      messageType: 'order_cancelled',
      ...getNodeStatus('order_cancelled'),
      branch: 'failure',
    },
  ];

  // Calculate stats
  const totalNodes = mainFlow.length + recoveryBranch.length + upsellBranch.length + cancelBranch.length;
  const configuredNodes = [...mainFlow, ...recoveryBranch, ...upsellBranch, ...cancelBranch].filter(n => n.isConfigured).length;
  const completionPercent = Math.round((configuredNodes / totalNodes) * 100);

  const FlowNodeComponent = ({ node, index, isLast }: { node: FlowNode; index: number; isLast?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col items-center"
    >
      <button
        onClick={() => onNodeClick(node.messageType)}
        className={cn(
          "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 min-w-[100px] group",
          node.isConfigured && node.isActive
            ? "bg-emerald-500/10 border-emerald-500/50 hover:border-emerald-500"
            : node.isConfigured
            ? "bg-amber-500/10 border-amber-500/50 hover:border-amber-500"
            : "bg-secondary/50 border-border hover:border-primary/50"
        )}
      >
        {/* Status indicator */}
        <div className={cn(
          "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
          node.isConfigured && node.isActive
            ? "bg-emerald-500 text-white"
            : node.isConfigured
            ? "bg-amber-500 text-white"
            : "bg-muted text-muted-foreground"
        )}>
          {node.isConfigured ? node.messageCount : '!'}
        </div>
        
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
          node.isConfigured && node.isActive
            ? "bg-emerald-500/20 text-emerald-400"
            : node.isConfigured
            ? "bg-amber-500/20 text-amber-400"
            : "bg-muted text-muted-foreground"
        )}>
          {node.icon}
        </div>
        
        {/* Label */}
        <span className="text-sm font-medium text-foreground">{node.label}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">{node.description}</span>
        
        {/* Optional badge */}
        {node.isOptional && (
          <Badge variant="outline" className="mt-1.5 text-[9px] px-1.5 py-0">
            Opcional
          </Badge>
        )}
      </button>
    </motion.div>
  );

  const Arrow = ({ direction = 'right', variant = 'default' }: { direction?: 'right' | 'down'; variant?: 'default' | 'success' | 'failure' }) => (
    <div className={cn(
      "flex items-center justify-center",
      direction === 'down' ? 'py-2' : 'px-1'
    )}>
      {direction === 'right' ? (
        <ArrowRight className={cn(
          "w-5 h-5",
          variant === 'success' ? 'text-emerald-500' : 
          variant === 'failure' ? 'text-red-500/50' : 
          'text-muted-foreground'
        )} />
      ) : (
        <ArrowDown className={cn(
          "w-5 h-5",
          variant === 'success' ? 'text-emerald-500' : 
          variant === 'failure' ? 'text-red-500/50' : 
          'text-muted-foreground'
        )} />
      )}
    </div>
  );

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-secondary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Fluxo da Jornada do Cliente</CardTitle>
            <Badge variant={completionPercent === 100 ? 'default' : 'secondary'}>
              {completionPercent}% configurado
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Ativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Inativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-muted-foreground">Não configurado</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 overflow-x-auto">
        {/* Main Flow */}
        <div className="min-w-[900px]">
          <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Fluxo Principal de Venda
          </div>
          <div className="flex items-center gap-1 mb-6 p-4 bg-secondary/30 rounded-xl">
            {mainFlow.map((node, index) => (
              <div key={node.id} className="flex items-center">
                <FlowNodeComponent node={node} index={index} />
                {index < mainFlow.length - 1 && <Arrow variant={index >= 4 ? 'success' : 'default'} />}
              </div>
            ))}
          </div>

          {/* Side Branches */}
          <div className="grid grid-cols-3 gap-4">
            {/* Recovery Branch */}
            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
              <div className="mb-3 text-xs font-medium text-red-400 uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-3 h-3" />
                Recuperação (Abandono)
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Após PIX →</div>
                {recoveryBranch.map((node, index) => (
                  <FlowNodeComponent key={node.id} node={node} index={index} />
                ))}
              </div>
            </div>

            {/* Upsell Branch */}
            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
              <div className="mb-3 text-xs font-medium text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Ofertas Adicionais
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Após Entrega →</div>
                {upsellBranch.map((node, index) => (
                  <div key={node.id} className="flex items-center">
                    <FlowNodeComponent node={node} index={index} />
                    {index < upsellBranch.length - 1 && <Arrow />}
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Branch */}
            <div className="p-4 bg-muted/30 rounded-xl border border-border">
              <div className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <X className="w-3 h-3" />
                Cancelamento
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Qualquer etapa →</div>
                {cancelBranch.map((node, index) => (
                  <FlowNodeComponent key={node.id} node={node} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
