import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCartRecovery, CartRecoveryMessage } from "@/hooks/useCartRecovery";
import { useClientSettings, useUpdateClientSettings } from "@/hooks/useClient";
import { Plus, Trash2, Clock, MessageSquare, Edit2, Save, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecoveryMessageFormProps {
  message?: CartRecoveryMessage;
  onSave: (data: Partial<CartRecoveryMessage>) => void;
  onCancel: () => void;
  displayOrder: number;
  clientId: string;
}

const RecoveryMessageForm = ({ message, onSave, onCancel, displayOrder, clientId }: RecoveryMessageFormProps) => {
  const [delayMinutes, setDelayMinutes] = useState(message?.delay_minutes?.toString() || "30");
  const [messageContent, setMessageContent] = useState(
    message?.message_content || 
    "Olá {nome}! 👋\n\nVimos que você não finalizou a compra do {produto}.\n\nO pagamento PIX no valor de {valor} ainda está disponível!\n\nApenas copie o código PIX e finalize sua compra. 💰"
  );
  const [isActive, setIsActive] = useState(message?.is_active ?? true);

  const handleSave = () => {
    onSave({
      id: message?.id,
      client_id: clientId,
      delay_minutes: parseInt(delayMinutes) || 30,
      message_content: messageContent,
      is_active: isActive,
      display_order: message?.display_order || displayOrder,
    });
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="delay" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Tempo de espera (minutos)
            </Label>
            <Input
              id="delay"
              type="number"
              min="1"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(e.target.value)}
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">
              Tempo após o pedido (ou última mensagem) para enviar
            </p>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Ativo</Label>
              <p className="text-xs text-muted-foreground">
                Habilitar esta mensagem
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Conteúdo da Mensagem
          </Label>
          <Textarea
            id="content"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            rows={5}
            placeholder="Digite a mensagem de recuperação..."
          />
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Variáveis disponíveis: <code className="bg-muted px-1 rounded">{"{nome}"}</code> (nome do cliente), 
              <code className="bg-muted px-1 rounded ml-1">{"{produto}"}</code> (nome do produto), 
              <code className="bg-muted px-1 rounded ml-1">{"{valor}"}</code> (valor do pedido)
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const CartRecoverySettings = ({ client }: { client: { id: string } }) => {
  const { data: settings, isLoading: settingsLoading } = useClientSettings(client.id);
  const updateSettings = useUpdateClientSettings();
  const { messages, isLoading, createMessage, updateMessage, deleteMessage } = useCartRecovery(client?.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!settings) return;
    await updateSettings.mutateAsync({ id: settings.id, cart_reminder_enabled: enabled });
  };

  const handleSaveMessage = async (data: Partial<CartRecoveryMessage>) => {
    if (data.id) {
      await updateMessage.mutateAsync({ id: data.id, ...data });
    } else {
      await createMessage.mutateAsync(data as Omit<CartRecoveryMessage, "id" | "created_at" | "updated_at">);
    }
    setEditingId(null);
    setIsCreating(false);
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta mensagem?")) {
      await deleteMessage.mutateAsync(id);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Recuperação de Vendas
            </CardTitle>
            <CardDescription>
              Configure mensagens automáticas para clientes que não finalizaram a compra
            </CardDescription>
          </div>
          <Switch
            checked={settings?.cart_reminder_enabled || false}
            onCheckedChange={handleToggleEnabled}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!settings?.cart_reminder_enabled && (
          <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
            Ative a recuperação de vendas para configurar as mensagens
          </div>
        )}

        {settings?.cart_reminder_enabled && (
          <>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando mensagens...
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={msg.id}>
                    {editingId === msg.id ? (
                      <RecoveryMessageForm
                        message={msg}
                        onSave={handleSaveMessage}
                        onCancel={() => setEditingId(null)}
                        displayOrder={msg.display_order}
                        clientId={client?.id || ""}
                      />
                    ) : (
                      <Card className={cn(
                        "transition-all",
                        !msg.is_active && "opacity-50"
                      )}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                                  Mensagem {index + 1}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {msg.delay_minutes} min
                                </span>
                                {!msg.is_active && (
                                  <span className="text-xs text-muted-foreground">(Inativa)</span>
                                )}
                              </div>
                              <p className="text-sm whitespace-pre-wrap line-clamp-3">
                                {msg.message_content}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingId(msg.id)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}

                {isCreating && (
                  <RecoveryMessageForm
                    onSave={handleSaveMessage}
                    onCancel={() => setIsCreating(false)}
                    displayOrder={messages.length + 1}
                    clientId={client?.id || ""}
                  />
                )}

                {!isCreating && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Mensagem de Recuperação
                  </Button>
                )}
              </div>
            )}

            {messages.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Como funciona:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• A primeira mensagem é enviada X minutos após o pedido ser criado</li>
                  <li>• As mensagens seguintes são enviadas X minutos após a mensagem anterior</li>
                  <li>• As mensagens param de ser enviadas quando o pedido é pago ou cancelado</li>
                  <li>• A verificação é feita a cada 5 minutos</li>
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};