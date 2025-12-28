import { useState } from 'react';
import { Bell, Save, Power, PowerOff, Info, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationTemplates, NotificationTemplate } from '@/hooks/useNotificationTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const eventTypeLabels: Record<string, string> = {
  sale: 'Venda Confirmada',
  order_created: 'Novo Pedido',
  delivery: 'Produto Entregue',
  cart_abandoned: 'Carrinho Abandonado',
  refund: 'Reembolso',
};

const eventTypeDescriptions: Record<string, string> = {
  sale: 'Enviada quando um pagamento é confirmado',
  order_created: 'Enviada quando um novo pedido é criado',
  delivery: 'Enviada quando um produto é entregue',
  cart_abandoned: 'Enviada para lembrar de carrinho abandonado',
  refund: 'Enviada quando um reembolso é processado',
};

const placeholderInfo: Record<string, string[]> = {
  sale: ['{amount}', '{product}', '{customer}'],
  order_created: ['{amount}', '{product}', '{customer}'],
  delivery: ['{product}', '{customer}'],
  cart_abandoned: ['{amount}', '{product}', '{customer}'],
  refund: ['{amount}', '{product}', '{customer}'],
};

export default function AdminNotificationsPage() {
  const { templates, isLoading, updateTemplate, toggleAllNotifications } = useNotificationTemplates();
  const [editingTemplates, setEditingTemplates] = useState<Record<string, NotificationTemplate>>({});
  const [testClientId, setTestClientId] = useState('');
  const [testType, setTestType] = useState('sale');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [clients, setClients] = useState<{ id: string; business_name: string }[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const { toast } = useToast();

  // Load clients for test dropdown
  const loadClients = async () => {
    if (clients.length > 0) return;
    setLoadingClients(true);
    const { data } = await supabase
      .from('clients')
      .select('id, business_name')
      .eq('is_active', true)
      .order('business_name');
    if (data) setClients(data);
    setLoadingClients(false);
  };

  const handleSendTest = async () => {
    if (!testClientId) {
      toast({ title: 'Selecione um cliente', variant: 'destructive' });
      return;
    }

    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          clientId: testClientId,
          type: testType,
          amount: 'R$ 99,90',
          product: 'Produto Teste',
          customer: 'Cliente Teste',
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Notificação enviada!',
          description: `Enviado para ${data.sent} dispositivo(s)`,
        });
      } else {
        toast({
          title: 'Não foi possível enviar',
          description: data?.reason || 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplates(prev => ({
      ...prev,
      [template.id]: { ...template },
    }));
  };

  const handleChange = (id: string, field: keyof NotificationTemplate, value: string | boolean) => {
    setEditingTemplates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = (id: string) => {
    const template = editingTemplates[id];
    if (template) {
      updateTemplate.mutate(template);
      setEditingTemplates(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleToggle = (template: NotificationTemplate) => {
    updateTemplate.mutate({
      id: template.id,
      is_active: !template.is_active,
    });
  };

  const allActive = templates?.every(t => t.is_active) ?? false;
  const someActive = templates?.some(t => t.is_active) ?? false;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notificações Push
          </h1>
          <p className="text-muted-foreground">
            Configure os templates de notificações enviadas aos clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={allActive ? "destructive" : "default"}
            onClick={() => toggleAllNotifications.mutate(!someActive)}
            disabled={toggleAllNotifications.isPending}
          >
            {someActive ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Desativar Todas
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Ativar Todas
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Push Card */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Notificação de Teste
          </CardTitle>
          <CardDescription>
            Teste o envio de notificações para um cliente específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Cliente</Label>
              <Select 
                value={testClientId} 
                onValueChange={setTestClientId}
                onOpenChange={(open) => open && loadClients()}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingClients ? "Carregando..." : "Selecione um cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.business_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-[180px]">
              <Label>Tipo de Evento</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSendTest} disabled={isSendingTest || !testClientId}>
              {isSendingTest ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Use placeholders como <code className="bg-muted px-1 rounded">{'{amount}'}</code>, 
          <code className="bg-muted px-1 rounded ml-1">{'{product}'}</code> e 
          <code className="bg-muted px-1 rounded ml-1">{'{customer}'}</code> para personalizar as mensagens.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {templates?.map(template => {
          const isEditing = !!editingTemplates[template.id];
          const current = editingTemplates[template.id] || template;

          return (
            <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{current.icon}</span>
                      {eventTypeLabels[template.event_type] || template.event_type}
                    </CardTitle>
                    <CardDescription>
                      {eventTypeDescriptions[template.event_type]}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={template.is_active}
                    onCheckedChange={() => handleToggle(template)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-[80px_1fr] gap-4">
                      <div className="space-y-2">
                        <Label>Ícone</Label>
                        <Input
                          value={current.icon}
                          onChange={e => handleChange(template.id, 'icon', e.target.value)}
                          className="text-center text-2xl"
                          maxLength={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={current.title}
                          onChange={e => handleChange(template.id, 'title', e.target.value)}
                          placeholder="Título da notificação"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Mensagem</Label>
                      <Textarea
                        value={current.body}
                        onChange={e => handleChange(template.id, 'body', e.target.value)}
                        placeholder="Corpo da notificação"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Placeholders disponíveis: {placeholderInfo[template.event_type]?.join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSave(template.id)} disabled={updateTemplate.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingTemplates(prev => {
                            const { [template.id]: _, ...rest } = prev;
                            return rest;
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="font-medium">{current.title}</p>
                      <p className="text-sm text-muted-foreground">{current.body}</p>
                    </div>
                    <Button variant="outline" onClick={() => handleEdit(template)}>
                      Editar Template
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
}
