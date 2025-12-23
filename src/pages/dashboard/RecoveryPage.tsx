import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useCartRecovery, CartRecoveryMessage } from "@/hooks/useCartRecovery";
import { useClientSettings, useUpdateClientSettings, Client } from "@/hooks/useClient";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Trash2, Clock, MessageSquare, Edit2, Save, X, Info, 
  RefreshCw, ShoppingCart, TrendingUp, AlertCircle, Loader2,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecoveryPageProps {
  client: Client;
}

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

export const RecoveryPage = ({ client }: RecoveryPageProps) => {
  const { toast } = useToast();
  const { data: settings, isLoading: settingsLoading } = useClientSettings(client.id);
  const updateSettings = useUpdateClientSettings();
  const { messages, isLoading, createMessage, updateMessage, deleteMessage } = useCartRecovery(client?.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch pending orders for recovery
  const { data: pendingOrders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["pending-orders-recovery", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          telegram_customers(first_name, last_name, telegram_username, telegram_id),
          products(name, price)
        `)
        .eq("client_id", client.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recovery stats
  const { data: recoveryStats } = useQuery({
    queryKey: ["recovery-stats", client.id],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recovered, error: recoveredError } = await supabase
        .from("orders")
        .select("amount")
        .eq("client_id", client.id)
        .eq("status", "paid")
        .gt("recovery_messages_sent", 0)
        .gte("paid_at", thirtyDaysAgo.toISOString());

      if (recoveredError) throw recoveredError;

      const totalRecovered = recovered?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
      const ordersRecovered = recovered?.length || 0;

      return { totalRecovered, ordersRecovered };
    },
  });

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

  const handleManualRecovery = async (orderId: string, customerId: string, telegramId: number, productName: string, amount: number, customerName: string) => {
    try {
      // Get the first active recovery message
      const activeMessage = messages.find(m => m.is_active);
      if (!activeMessage) {
        toast({
          title: "Nenhuma mensagem configurada",
          description: "Configure pelo menos uma mensagem de recuperação ativa.",
          variant: "destructive",
        });
        return;
      }

      // Personalize message
      let messageContent = activeMessage.message_content;
      messageContent = messageContent.replace("{nome}", customerName || "Cliente");
      messageContent = messageContent.replace("{produto}", productName || "produto");
      messageContent = messageContent.replace("{valor}", `R$ ${Number(amount).toFixed(2).replace(".", ",")}`);

      // Call edge function to send message
      const { error } = await supabase.functions.invoke("telegram-bot", {
        body: {
          action: "send_message",
          chat_id: telegramId,
          text: messageContent,
        },
      });

      if (error) throw error;

      // Update order recovery count
      await supabase
        .from("orders")
        .update({
          recovery_messages_sent: 1,
          last_recovery_sent_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      toast({
        title: "Mensagem enviada!",
        description: "A mensagem de recuperação foi enviada com sucesso.",
      });

      refetchOrders();
    } catch (error) {
      console.error("Error sending recovery message:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-primary" />
          Recuperação de Vendas
        </h1>
        <p className="text-muted-foreground">
          Recupere vendas de clientes que não finalizaram o pagamento
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <ShoppingCart className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas Recuperadas (30d)</p>
                <p className="text-2xl font-bold">{recoveryStats?.ordersRecovered || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Recuperado (30d)</p>
                <p className="text-2xl font-bold">
                  R$ {(recoveryStats?.totalRecovered || 0).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders Section */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Pedidos Não Pagos
              </CardTitle>
              <CardDescription>
                Envie mensagens manualmente ou aguarde o disparo automático
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchOrders()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum pedido pendente no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.slice(0, 10).map((order: any) => {
                const customer = order.telegram_customers;
                const product = order.products;
                const createdAt = new Date(order.created_at);
                const minutesAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60));
                
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {customer?.first_name || "Cliente"} {customer?.last_name || ""}
                        </span>
                        {customer?.telegram_username && (
                          <span className="text-xs text-muted-foreground">
                            @{customer.telegram_username}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{product?.name || "Produto"}</span>
                        <span className="font-medium text-foreground">
                          R$ {Number(order.amount).toFixed(2).replace(".", ",")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {minutesAgo < 60 
                            ? `${minutesAgo}min atrás` 
                            : `${Math.floor(minutesAgo / 60)}h atrás`}
                        </span>
                      </div>
                      {order.recovery_messages_sent > 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {order.recovery_messages_sent} mensagem(ns) enviada(s)
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleManualRecovery(
                        order.id,
                        order.customer_id,
                        customer?.telegram_id,
                        product?.name,
                        order.amount,
                        customer?.first_name
                      )}
                      disabled={!messages.some(m => m.is_active)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                );
              })}
              {pendingOrders.length > 10 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  E mais {pendingOrders.length - 10} pedidos pendentes...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Recovery Settings */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Mensagens Automáticas
              </CardTitle>
              <CardDescription>
                Configure mensagens que serão enviadas automaticamente
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
              Ative as mensagens automáticas para configurar os disparos
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
                    <li>• A verificação automática é feita a cada 5 minutos</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};