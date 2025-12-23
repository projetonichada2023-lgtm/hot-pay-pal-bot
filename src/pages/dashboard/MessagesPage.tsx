import { useState, useRef } from 'react';
import { Client } from '@/hooks/useClient';
import { 
  useBotMessages, 
  useUpdateBotMessage, 
  useCreateBotMessage, 
  useDeleteBotMessage,
  useReorderBotMessages,
  BotMessage,
  MessageButton,
} from '@/hooks/useBotMessages';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  MessageSquare, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Image,
  Video,
  X,
  Upload
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ButtonEditor } from '@/components/messages/ButtonEditor';

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
    description: 'Mensagens enviadas quando o usuário inicia o bot',
    icon: '👋',
    allowMultiple: true,
  },
  payment_instructions: { 
    label: 'Instruções de Pagamento', 
    description: 'Instruções para pagamento PIX',
    icon: '💳',
    allowMultiple: false,
  },
  payment_success: { 
    label: 'Pagamento Confirmado', 
    description: 'Mensagem após confirmação do pagamento',
    icon: '✅',
    allowMultiple: false,
  },
  order_created: { 
    label: 'Pedido Criado', 
    description: 'Mensagem ao criar um novo pedido',
    icon: '🛒',
    allowMultiple: false,
  },
  order_cancelled: { 
    label: 'Pedido Cancelado', 
    description: 'Mensagem quando pedido é cancelado',
    icon: '❌',
    allowMultiple: false,
  },
  cart_reminder: { 
    label: 'Lembrete de Carrinho', 
    description: 'Lembrete para pedidos pendentes',
    icon: '⏰',
    allowMultiple: false,
  },
  upsell: { 
    label: 'Upsell', 
    description: 'Oferta adicional após compra',
    icon: '🔥',
    allowMultiple: false,
  },
  support: { 
    label: 'Suporte', 
    description: 'Mensagem de suporte ao cliente',
    icon: '💬',
    allowMultiple: false,
  },
  product_delivered: { 
    label: 'Produto Entregue', 
    description: 'Confirmação de entrega do produto',
    icon: '📦',
    allowMultiple: false,
  },
  no_products: { 
    label: 'Sem Produtos', 
    description: 'Quando não há produtos disponíveis',
    icon: '😕',
    allowMultiple: false,
  },
};

export const MessagesPage = ({ client }: MessagesPageProps) => {
  const { data: messages, isLoading } = useBotMessages(client.id);
  const updateMessage = useUpdateBotMessage();
  const createMessage = useCreateBotMessage();
  const deleteMessage = useDeleteBotMessage();
  const reorderMessages = useReorderBotMessages();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMediaUrl, setEditMediaUrl] = useState<string | null>(null);
  const [editMediaType, setEditMediaType] = useState<string | null>(null);
  const [editButtons, setEditButtons] = useState<MessageButton[]>([]);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['welcome']));
  const [uploading, setUploading] = useState(false);

  const handleEdit = (message: BotMessage) => {
    setEditingId(message.id);
    setEditContent(message.message_content);
    setEditMediaUrl(message.media_url);
    setEditMediaType(message.media_type);
    setEditButtons(message.buttons || []);
  };

  const handleSave = async (id: string) => {
    try {
      await updateMessage.mutateAsync({ 
        id, 
        message_content: editContent,
        media_url: editMediaUrl,
        media_type: editMediaType,
        buttons: editButtons,
      });
      setEditingId(null);
      setEditMediaUrl(null);
      setEditMediaType(null);
      setEditButtons([]);
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
    } catch (error) {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage.mutateAsync(id);
      toast({ title: 'Mensagem removida!' });
    } catch (error) {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const handleMoveUp = async (messageType: string, msgs: BotMessage[], index: number) => {
    if (index === 0) return;
    const newMessages = [...msgs];
    [newMessages[index - 1], newMessages[index]] = [newMessages[index], newMessages[index - 1]];
    const updates = newMessages.map((m, i) => ({ id: m.id, display_order: i + 1 }));
    try {
      await reorderMessages.mutateAsync(updates);
    } catch (error) {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
    }
  };

  const handleMoveDown = async (messageType: string, msgs: BotMessage[], index: number) => {
    if (index === msgs.length - 1) return;
    const newMessages = [...msgs];
    [newMessages[index], newMessages[index + 1]] = [newMessages[index + 1], newMessages[index]];
    const updates = newMessages.map((m, i) => ({ id: m.id, display_order: i + 1 }));
    try {
      await reorderMessages.mutateAsync(updates);
    } catch (error) {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
    }
  };

  const handleMediaUpload = async (file: File) => {
    setUploading(true);
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
      
      const isVideo = file.type.startsWith('video/');
      setEditMediaUrl(publicUrl);
      setEditMediaType(isVideo ? 'video' : 'image');
      
      toast({ title: 'Mídia enviada!' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Erro ao enviar mídia', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setEditMediaUrl(null);
    setEditMediaType(null);
  };

  const toggleExpanded = (type: string) => {
    const newSet = new Set(expandedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setExpandedTypes(newSet);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  // Get all message types (from existing + config)
  const allMessageTypes = Array.from(new Set([
    ...Object.keys(messageLabels),
    ...Object.keys(groupedMessages),
  ]));

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
        {allMessageTypes.map((messageType) => {
          const config = messageLabels[messageType] || {
            label: messageType,
            description: '',
            icon: '📝',
            allowMultiple: false,
          };
          const typeMessages = groupedMessages[messageType] || [];
          const isExpanded = expandedTypes.has(messageType);
          const hasMultiple = typeMessages.length > 1;

          if (config.allowMultiple) {
            return (
              <Collapsible key={messageType} open={isExpanded} onOpenChange={() => toggleExpanded(messageType)}>
                <Card className="glass-card">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {config.label}
                              {hasMultiple && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  {typeMessages.length} mensagens
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {config.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMessage(messageType, typeMessages);
                            }}
                            disabled={createMessage.isPending}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {typeMessages.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          Nenhuma mensagem configurada. Clique em "Adicionar" para criar uma.
                        </p>
                      ) : (
                        typeMessages
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((message, index) => (
                            <MessageItem
                              key={message.id}
                              message={message}
                              index={index}
                              totalCount={typeMessages.length}
                              isEditing={editingId === message.id}
                              editContent={editContent}
                              editMediaUrl={editMediaUrl}
                              editMediaType={editMediaType}
                              onEditContentChange={setEditContent}
                              onEdit={() => handleEdit(message)}
                              onSave={() => handleSave(message.id)}
                              onCancel={() => {
                                setEditingId(null);
                                setEditMediaUrl(null);
                                setEditMediaType(null);
                              }}
                              onToggle={(checked) => handleToggle(message.id, checked)}
                              onDelete={() => handleDelete(message.id)}
                              onMoveUp={() => handleMoveUp(messageType, typeMessages.sort((a, b) => a.display_order - b.display_order), index)}
                              onMoveDown={() => handleMoveDown(messageType, typeMessages.sort((a, b) => a.display_order - b.display_order), index)}
                              onMediaUpload={handleMediaUpload}
                              onRemoveMedia={handleRemoveMedia}
                              isPending={updateMessage.isPending}
                              uploading={uploading}
                              allowDelete={typeMessages.length > 1}
                              showOrder={typeMessages.length > 1}
                            />
                          ))
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          }

          // Single message card for types that don't allow multiple
          const message = typeMessages[0];
          if (!message) return null;

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
                  <MessageEditor
                    content={editContent}
                    mediaUrl={editMediaUrl}
                    mediaType={editMediaType}
                    onContentChange={setEditContent}
                    onMediaUpload={handleMediaUpload}
                    onRemoveMedia={handleRemoveMedia}
                    onSave={() => handleSave(message.id)}
                    onCancel={() => {
                      setEditingId(null);
                      setEditMediaUrl(null);
                      setEditMediaType(null);
                    }}
                    isPending={updateMessage.isPending}
                    uploading={uploading}
                  />
                ) : (
                  <>
                    {message.media_url && (
                      <MediaPreview url={message.media_url} type={message.media_type} />
                    )}
                    <div className="p-3 bg-secondary/50 rounded-lg text-sm whitespace-pre-wrap">
                      {message.message_content}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(message)}
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

// Media Preview Component
const MediaPreview = ({ url, type }: { url: string; type: string | null }) => {
  if (type === 'video') {
    return (
      <video 
        src={url} 
        controls 
        className="max-h-48 rounded-lg w-full object-contain bg-secondary/30"
      />
    );
  }
  return (
    <img 
      src={url} 
      alt="Media preview" 
      className="max-h-48 rounded-lg object-contain"
    />
  );
};

// Message Editor Component
interface MessageEditorProps {
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  buttons: MessageButton[];
  onContentChange: (content: string) => void;
  onMediaUpload: (file: File) => void;
  onRemoveMedia: () => void;
  onButtonsChange: (buttons: MessageButton[]) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
  uploading: boolean;
}

const MessageEditor = ({
  content,
  mediaUrl,
  mediaType,
  buttons,
  onContentChange,
  onMediaUpload,
  onRemoveMedia,
  onButtonsChange,
  onSave,
  onCancel,
  isPending,
  uploading,
}: MessageEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      {/* Media preview with remove button */}
      {mediaUrl && (
        <div className="relative inline-block">
          <MediaPreview url={mediaUrl} type={mediaType} />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={onRemoveMedia}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Media upload buttons */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onMediaUpload(file);
          }}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {mediaUrl ? 'Trocar Mídia' : 'Adicionar Foto/Vídeo'}
        </Button>
      </div>

      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="min-h-[100px] resize-none"
        placeholder="Digite a mensagem..."
      />

      {/* Button editor */}
      <ButtonEditor buttons={buttons} onChange={onButtonsChange} />

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={onSave}
          disabled={isPending || uploading}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar
        </Button>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

// Sub-component for individual message items in multi-message sections
interface MessageItemProps {
  message: BotMessage;
  index: number;
  totalCount: number;
  isEditing: boolean;
  editContent: string;
  editMediaUrl: string | null;
  editMediaType: string | null;
  onEditContentChange: (content: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMediaUpload: (file: File) => void;
  onRemoveMedia: () => void;
  isPending: boolean;
  uploading: boolean;
  allowDelete: boolean;
  showOrder: boolean;
}

const MessageItem = ({
  message,
  index,
  totalCount,
  isEditing,
  editContent,
  editMediaUrl,
  editMediaType,
  onEditContentChange,
  onEdit,
  onSave,
  onCancel,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMediaUpload,
  onRemoveMedia,
  isPending,
  uploading,
  allowDelete,
  showOrder,
}: MessageItemProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border border-border/50 rounded-lg p-4 space-y-3 bg-card/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showOrder && (
            <div className="flex flex-col gap-0.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={onMoveUp}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={onMoveDown}
                disabled={index === totalCount - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Mensagem {index + 1}
            </span>
            {message.media_type && (
              <span className="text-xs bg-secondary px-2 py-0.5 rounded flex items-center gap-1">
                {message.media_type === 'video' ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                {message.media_type === 'video' ? 'Vídeo' : 'Foto'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor={`toggle-${message.id}`} className="text-xs text-muted-foreground">
            {message.is_active ? 'Ativo' : 'Inativo'}
          </Label>
          <Switch
            id={`toggle-${message.id}`}
            checked={message.is_active}
            onCheckedChange={onToggle}
          />
          {allowDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover mensagem?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Remover</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {/* Media preview */}
          {editMediaUrl && (
            <div className="relative inline-block">
              <MediaPreview url={editMediaUrl} type={editMediaType} />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={onRemoveMedia}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Media upload */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onMediaUpload(file);
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {editMediaUrl ? 'Trocar' : 'Foto/Vídeo'}
            </Button>
          </div>

          <Textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="min-h-[80px] resize-none"
            placeholder="Digite a mensagem..."
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSave} disabled={isPending || uploading}>
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {message.media_url && (
            <MediaPreview url={message.media_url} type={message.media_type} />
          )}
          <div className="p-3 bg-secondary/30 rounded-lg text-sm whitespace-pre-wrap">
            {message.message_content}
          </div>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Sparkles className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </>
      )}
    </div>
  );
};
