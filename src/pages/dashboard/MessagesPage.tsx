import { useState } from 'react';
import { Client, useBotMessages, useUpdateBotMessage } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Save, Sparkles } from 'lucide-react';

interface MessagesPageProps {
  client: Client;
}

const messageLabels: Record<string, { label: string; description: string; icon: string }> = {
  welcome: { 
    label: 'Boas-vindas', 
    description: 'Mensagem enviada quando o usuário inicia o bot',
    icon: '👋'
  },
  payment_instructions: { 
    label: 'Instruções de Pagamento', 
    description: 'Instruções para pagamento PIX',
    icon: '💳'
  },
  payment_success: { 
    label: 'Pagamento Confirmado', 
    description: 'Mensagem após confirmação do pagamento',
    icon: '✅'
  },
  order_created: { 
    label: 'Pedido Criado', 
    description: 'Mensagem ao criar um novo pedido',
    icon: '🛒'
  },
  order_cancelled: { 
    label: 'Pedido Cancelado', 
    description: 'Mensagem quando pedido é cancelado',
    icon: '❌'
  },
  cart_reminder: { 
    label: 'Lembrete de Carrinho', 
    description: 'Lembrete para pedidos pendentes',
    icon: '⏰'
  },
  upsell: { 
    label: 'Upsell', 
    description: 'Oferta adicional após compra',
    icon: '🔥'
  },
  support: { 
    label: 'Suporte', 
    description: 'Mensagem de suporte ao cliente',
    icon: '💬'
  },
  product_delivered: { 
    label: 'Produto Entregue', 
    description: 'Confirmação de entrega do produto',
    icon: '📦'
  },
  no_products: { 
    label: 'Sem Produtos', 
    description: 'Quando não há produtos disponíveis',
    icon: '😕'
  },
};

export const MessagesPage = ({ client }: MessagesPageProps) => {
  const { data: messages, isLoading } = useBotMessages(client.id);
  const updateMessage = useUpdateBotMessage();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSave = async (id: string) => {
    try {
      await updateMessage.mutateAsync({ id, message_content: editContent });
      setEditingId(null);
      toast({ title: 'Mensagem atualizada!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateMessage.mutateAsync({ id, is_active: isActive });
      toast({ title: isActive ? 'Mensagem ativada' : 'Mensagem desativada' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Mensagens do Bot
          </h1>
          <p className="text-muted-foreground">
            Personalize todas as mensagens enviadas pelo seu bot
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {messages?.map((message) => {
          const config = messageLabels[message.message_type] || {
            label: message.message_type,
            description: '',
            icon: '📝'
          };
          const isEditing = editingId === message.id;

          return (
            <Card key={message.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      <CardDescription className="text-sm">
                        {config.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`toggle-${message.id}`} className="text-sm text-muted-foreground">
                      {message.is_active ? 'Ativo' : 'Inativo'}
                    </Label>
                    <Switch
                      id={`toggle-${message.id}`}
                      checked={message.is_active}
                      onCheckedChange={(checked) => handleToggle(message.id, checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px] resize-none"
                      placeholder="Digite a mensagem..."
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleSave(message.id)}
                        disabled={updateMessage.isPending}
                      >
                        {updateMessage.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-secondary/50 rounded-lg text-sm whitespace-pre-wrap">
                      {message.message_content}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(message.id, message.message_content)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Editar Mensagem
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
