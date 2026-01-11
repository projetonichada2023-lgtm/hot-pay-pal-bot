import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { 
  useBotMessages, 
  useUpdateBotMessage, 
  useCreateBotMessage, 
  useDeleteBotMessage,
  useReorderBotMessages,
  BotMessage,
} from '@/hooks/useBotMessages';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  MessageSquare, 
  Sparkles,
  Search,
  Smartphone,
  GitBranch,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MessageTypeSection } from '@/components/messages/MessageTypeSection';
import { MessageFlowDiagram } from '@/components/messages/MessageFlowDiagram';
import { Badge } from '@/components/ui/badge';

interface MessagesPageProps {
  client: Client;
}

interface MessageConfig {
  label: string;
  description: string;
  icon: string;
  allowMultiple: boolean;
}

const messageLabels: Record<string, MessageConfig> = {
  welcome: { 
    label: 'Boas-vindas', 
    description: 'Primeira impressão do cliente ao iniciar o bot',
    icon: '👋',
    allowMultiple: true,
  },
  catalog: { 
    label: 'Catálogo', 
    description: 'Apresentação dos produtos disponíveis',
    icon: '📦',
    allowMultiple: true,
  },
  product_detail: { 
    label: 'Detalhe do Produto', 
    description: 'Informações detalhadas de cada produto',
    icon: '🏷️',
    allowMultiple: true,
  },
  pix_generated: { 
    label: 'PIX Gerado', 
    description: 'Código PIX para pagamento',
    icon: '💳',
    allowMultiple: true,
  },
  payment_confirmed: { 
    label: 'Pagamento Confirmado', 
    description: 'Confirmação após aprovação do pagamento',
    icon: '✅',
    allowMultiple: true,
  },
  delivery: { 
    label: 'Entrega', 
    description: 'Link de acesso ao produto digital',
    icon: '📦',
    allowMultiple: true,
  },
  thank_you: { 
    label: 'Agradecimento', 
    description: 'Mensagem de pós-venda e fidelização',
    icon: '❤️',
    allowMultiple: true,
  },
  order_created: { 
    label: 'Pedido Criado', 
    description: 'Confirmação de criação do pedido',
    icon: '🛒',
    allowMultiple: true,
  },
  order_cancelled: { 
    label: 'Pedido Cancelado', 
    description: 'Aviso de cancelamento do pedido',
    icon: '❌',
    allowMultiple: true,
  },
  cart_reminder: { 
    label: 'Lembrete de Carrinho', 
    description: 'Recuperação de pedidos abandonados',
    icon: '⏰',
    allowMultiple: true,
  },
  upsell: { 
    label: 'Upsell', 
    description: 'Oferta adicional após compra',
    icon: '🔥',
    allowMultiple: true,
  },
  downsell: { 
    label: 'Downsell', 
    description: 'Oferta alternativa se recusar upsell',
    icon: '💡',
    allowMultiple: true,
  },
  support: { 
    label: 'Suporte', 
    description: 'Mensagem de atendimento ao cliente',
    icon: '💬',
    allowMultiple: true,
  },
  no_products: { 
    label: 'Sem Produtos', 
    description: 'Quando não há produtos disponíveis',
    icon: '😕',
    allowMultiple: true,
  },
};

const categories = {
  all: { label: 'Todas', icon: '📋', types: Object.keys(messageLabels) },
  sales: { label: 'Fluxo de Venda', icon: '🛒', types: ['welcome', 'catalog', 'product_detail', 'pix_generated', 'payment_confirmed', 'delivery', 'thank_you'] },
  orders: { label: 'Pedidos', icon: '📦', types: ['order_created', 'order_cancelled'] },
  marketing: { label: 'Marketing', icon: '📈', types: ['cart_reminder', 'upsell', 'downsell'] },
  other: { label: 'Outros', icon: '💬', types: ['support', 'no_products'] },
};

export const MessagesPage = ({ client }: MessagesPageProps) => {
  const { data: messages, isLoading } = useBotMessages(client.id);
  const updateMessage = useUpdateBotMessage();
  const createMessage = useCreateBotMessage();
  const deleteMessage = useDeleteBotMessage();
  const reorderMessages = useReorderBotMessages();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['welcome']));
  const [activeTab, setActiveTab] = useState('sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFlowDiagram, setShowFlowDiagram] = useState(false);

  const handleUpdateMessage = async (id: string, updates: Partial<BotMessage>) => {
    try {
      await updateMessage.mutateAsync({ id, ...updates });
      toast({ title: 'Mensagem atualizada!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleAddMessage = async (messageType: string, existingMessages: BotMessage[]) => {
    try {
      const maxOrder = Math.max(0, ...existingMessages.map(m => m.display_order));
      await createMessage.mutateAsync({
        client_id: client.id,
        message_type: messageType,
        message_content: 'Nova mensagem...',
        display_order: maxOrder + 1,
      });
      toast({ title: 'Mensagem adicionada!' });
      
      // Expand the section
      setExpandedTypes(prev => new Set([...prev, messageType]));
    } catch (error) {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' });
    }
  };

  const handleAddMessageWithContent = async (
    messageType: string, 
    existingMessages: BotMessage[], 
    content: string, 
    buttons?: Array<{ text: string; type: 'callback' | 'url'; value: string }>
  ) => {
    try {
      const maxOrder = Math.max(0, ...existingMessages.map(m => m.display_order));
      await createMessage.mutateAsync({
        client_id: client.id,
        message_type: messageType,
        message_content: content,
        display_order: maxOrder + 1,
        buttons: buttons as any,
      });
      toast({ title: 'Mensagem criada a partir do template!' });
      
      // Expand the section
      setExpandedTypes(prev => new Set([...prev, messageType]));
    } catch (error) {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMessage.mutateAsync(id);
      toast({ title: 'Mensagem removida!' });
    } catch (error) {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const handleReorderMessages = async (updates: { id: string; display_order: number }[]) => {
    try {
      await reorderMessages.mutateAsync(updates);
    } catch (error) {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
    }
  };

  const handleMediaUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${client.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('bot-media')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('bot-media')
        .getPublicUrl(fileName);
      
      toast({ title: 'Mídia enviada!' });
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Erro ao enviar mídia', variant: 'destructive' });
      return null;
    }
  };

  const toggleExpanded = (type: string) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleFlowNodeClick = (messageType: string) => {
    setActiveTab('all');
    setExpandedTypes(prev => new Set([...prev, messageType]));
    setShowFlowDiagram(false);
    // Scroll to the message type after a short delay
    setTimeout(() => {
      const element = document.getElementById(`message-type-${messageType}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  // Group messages by type
  const groupedMessages = messages?.reduce((acc, msg) => {
    if (!acc[msg.message_type]) {
      acc[msg.message_type] = [];
    }
    acc[msg.message_type].push(msg);
    return acc;
  }, {} as Record<string, BotMessage[]>) || {};

  // Get current category types
  const currentCategory = categories[activeTab as keyof typeof categories];
  const visibleTypes = currentCategory.types.filter(type => {
    if (!searchQuery) return true;
    const config = messageLabels[type];
    return config?.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
           config?.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Stats
  const totalMessages = messages?.length || 0;
  const activeMessages = messages?.filter(m => m.is_active).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shadow-lg shadow-primary/10">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mensagens do Bot</h1>
              <p className="text-muted-foreground mt-1">
                Personalize todas as mensagens enviadas pelo seu bot
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary" className="font-normal">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  {totalMessages} mensagens
                </Badge>
                <Badge variant="outline" className="font-normal text-emerald-400 border-emerald-400/30">
                  {activeMessages} ativas
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={showFlowDiagram ? "default" : "outline"}
              onClick={() => setShowFlowDiagram(!showFlowDiagram)}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Ver Fluxo
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/simulator')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Simulador
            </Button>
          </div>
        </div>

        {/* Flow Diagram */}
        {showFlowDiagram && messages && (
          <MessageFlowDiagram 
            messages={messages} 
            onNodeClick={handleFlowNodeClick}
            onClose={() => setShowFlowDiagram(false)}
          />
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tipo de mensagem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-secondary/30 p-1 h-auto flex-wrap">
          {Object.entries(categories).map(([key, cat]) => {
            const count = cat.types.reduce((acc, type) => acc + (groupedMessages[type]?.length || 0), 0);
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5"
              >
                <span className="mr-2">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {visibleTypes.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/50 mb-4">
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Nenhum tipo de mensagem encontrado para "{searchQuery}"
                </p>
                <Button 
                  variant="link" 
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Limpar busca
                </Button>
              </div>
            ) : (
              visibleTypes.map((messageType) => {
                const config = messageLabels[messageType] || {
                  label: messageType,
                  description: '',
                  icon: '📝',
                  allowMultiple: false,
                };
                const typeMessages = groupedMessages[messageType] || [];

                return (
                  <MessageTypeSection
                    key={messageType}
                    messageType={messageType}
                    config={config}
                    messages={typeMessages}
                    isExpanded={expandedTypes.has(messageType)}
                    onToggleExpanded={() => toggleExpanded(messageType)}
                    onAddMessage={() => handleAddMessage(messageType, typeMessages)}
                    onAddMessageWithContent={(content, buttons) => handleAddMessageWithContent(messageType, typeMessages, content, buttons)}
                    onUpdateMessage={handleUpdateMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onReorderMessages={handleReorderMessages}
                    onMediaUpload={handleMediaUpload}
                    isPending={updateMessage.isPending}
                    isCreating={createMessage.isPending}
                  />
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
