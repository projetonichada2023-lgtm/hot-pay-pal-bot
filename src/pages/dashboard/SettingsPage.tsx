import { Client, useClientSettings, useUpdateClientSettings } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings, Loader2, CreditCard, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface SettingsPageProps {
  client: Client;
}

export const SettingsPage = ({ client }: SettingsPageProps) => {
  const { data: settings, isLoading } = useClientSettings(client.id);
  const updateSettings = useUpdateClientSettings();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

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

  const handleSaveApiKey = async () => {
    if (!settings || !apiKey.trim()) return;
    try {
      await updateSettings.mutateAsync({ 
        id: settings.id, 
        fastsoft_api_key: apiKey.trim(),
        fastsoft_enabled: true 
      } as any);
      toast({ title: 'Chave API salva com sucesso!' });
      setApiKey('');
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleToggleFastsoft = async (enabled: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, fastsoft_enabled: enabled } as any);
      toast({ title: enabled ? 'FastSoft ativado!' : 'FastSoft desativado!' });
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

  const hasApiKey = !!(settings as any).fastsoft_api_key;
  const fastsoftEnabled = (settings as any).fastsoft_enabled || false;

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

      {/* Payment Gateway */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Gateway de Pagamento (FastSoft/UniPay)
          </CardTitle>
          <CardDescription>
            Configure suas credenciais para receber pagamentos PIX reais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>FastSoft Ativo</Label>
              <p className="text-sm text-muted-foreground">
                {hasApiKey ? 'Usar FastSoft para pagamentos PIX' : 'Configure a API Key primeiro'}
              </p>
            </div>
            <Switch
              checked={fastsoftEnabled}
              onCheckedChange={handleToggleFastsoft}
              disabled={!hasApiKey}
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <Label>API Key FastSoft</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={hasApiKey ? '••••••••••••••••' : 'Cole sua API Key aqui'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                Salvar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha em: Painel FastSoft → Configurações → Chave de API
            </p>
          </div>

          {hasApiKey && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ API Key configurada. Os pagamentos PIX serão processados pela FastSoft.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automations */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Automações</CardTitle>
          <CardDescription>Configure as automações do seu bot</CardDescription>
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
              <p className="text-sm text-muted-foreground">Mostrar opção de suporte no menu</p>
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
                <p className="text-sm text-muted-foreground">Enviar lembrete para pedidos pendentes</p>
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
          <CardDescription>Dados da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nome do Negócio</Label>
              <Input value={client.business_name} readOnly className="mt-2" />
            </div>
            <div>
              <Label>Status</Label>
              <Input value={client.is_active ? 'Ativo' : 'Inativo'} readOnly className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
