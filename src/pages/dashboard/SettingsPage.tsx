import { Client, useClientSettings, useUpdateClientSettings } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Settings, Loader2 } from 'lucide-react';

interface SettingsPageProps {
  client: Client;
}

export const SettingsPage = ({ client }: SettingsPageProps) => {
  const { data: settings, isLoading } = useClientSettings(client.id);
  const updateSettings = useUpdateClientSettings();
  const { toast } = useToast();

  const handleToggle = async (field: string, value: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, [field]: value });
      toast({ title: 'Configuração atualizada!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleHoursChange = async (hours: number) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, cart_reminder_hours: hours });
      toast({ title: 'Configuração atualizada!' });
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

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Configure o comportamento do seu bot
        </p>
      </div>

      {/* Automations */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Automações</CardTitle>
          <CardDescription>
            Configure as automações do seu bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Entrega Automática</Label>
              <p className="text-sm text-muted-foreground">
                Enviar produto automaticamente após confirmação de pagamento
              </p>
            </div>
            <Switch
              checked={settings.auto_delivery}
              onCheckedChange={(checked) => handleToggle('auto_delivery', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Suporte Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar opção de suporte no menu do bot
              </p>
            </div>
            <Switch
              checked={settings.support_enabled}
              onCheckedChange={(checked) => handleToggle('support_enabled', checked)}
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembrete de Carrinho</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar lembrete para pedidos pendentes
                </p>
              </div>
              <Switch
                checked={settings.cart_reminder_enabled}
                onCheckedChange={(checked) => handleToggle('cart_reminder_enabled', checked)}
              />
            </div>

            {settings.cart_reminder_enabled && (
              <div className="pl-4 border-l-2 border-primary/50">
                <Label htmlFor="reminder-hours">Horas para lembrete</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="reminder-hours"
                    type="number"
                    min={1}
                    max={72}
                    value={settings.cart_reminder_hours}
                    onChange={(e) => handleHoursChange(parseInt(e.target.value) || 24)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">horas</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Informações do Negócio</CardTitle>
          <CardDescription>
            Dados da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nome do Negócio</Label>
              <Input value={client.business_name} readOnly className="mt-2" />
            </div>
            <div>
              <Label>Status</Label>
              <Input 
                value={client.is_active ? 'Ativo' : 'Inativo'} 
                readOnly 
                className="mt-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
