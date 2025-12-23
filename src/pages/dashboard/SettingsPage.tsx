import { Client, useClientSettings, useUpdateClientSettings, useUpdateClient } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Settings, Loader2, CreditCard, Clock, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettingsPageProps {
  client: Client;
}

const DAYS_OF_WEEK = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
];

const PIX_KEY_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatória' },
];

export const SettingsPage = ({ client }: SettingsPageProps) => {
  const { data: settings, isLoading } = useClientSettings(client.id);
  const updateSettings = useUpdateClientSettings();
  const updateClient = useUpdateClient();
  const { toast } = useToast();

  // Local state for debounced inputs
  const [pixKey, setPixKey] = useState('');
  const [pixReceiverName, setPixReceiverName] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  // Sync local state with settings
  useEffect(() => {
    if (settings) {
      setPixKey(settings.pix_key || '');
      setPixReceiverName(settings.pix_receiver_name || '');
      setOpeningTime(settings.opening_time?.slice(0, 5) || '');
      setClosingTime(settings.closing_time?.slice(0, 5) || '');
    }
  }, [settings]);

  useEffect(() => {
    if (client) {
      setBusinessPhone(client.business_phone || '');
      setBusinessEmail(client.business_email || '');
      setBusinessDescription(client.business_description || '');
    }
  }, [client]);

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

  const handleSettingsUpdate = async (field: string, value: string | string[] | null) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ id: settings.id, [field]: value });
      toast({ title: 'Configuração atualizada!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleClientUpdate = async (field: string, value: string | null) => {
    try {
      await updateClient.mutateAsync({ id: client.id, [field]: value });
      toast({ title: 'Informação atualizada!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleWorkingDaysChange = async (dayId: string, checked: boolean) => {
    if (!settings) return;
    const currentDays = settings.working_days || [];
    const newDays = checked
      ? [...currentDays, dayId]
      : currentDays.filter(d => d !== dayId);
    
    try {
      await updateSettings.mutateAsync({ id: settings.id, working_days: newDays });
      toast({ title: 'Dias de funcionamento atualizados!' });
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
          Configure o comportamento do seu bot e informações do negócio
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

      {/* PIX Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Configurações PIX
          </CardTitle>
          <CardDescription>
            Configure sua chave PIX para receber pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de Chave</Label>
              <Select
                value={settings.pix_key_type || ''}
                onValueChange={(value) => handleSettingsUpdate('pix_key_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PIX_KEY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chave PIX</Label>
              <Input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                onBlur={() => handleSettingsUpdate('pix_key', pixKey || null)}
                placeholder="Sua chave PIX"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nome do Recebedor</Label>
            <Input
              value={pixReceiverName}
              onChange={(e) => setPixReceiverName(e.target.value)}
              onBlur={() => handleSettingsUpdate('pix_receiver_name', pixReceiverName || null)}
              placeholder="Nome que aparecerá no comprovante"
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Horário de Funcionamento
          </CardTitle>
          <CardDescription>
            Configure os dias e horários de atendimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Dias de Funcionamento</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={settings.working_days?.includes(day.id) || false}
                    onCheckedChange={(checked) => handleWorkingDaysChange(day.id, checked as boolean)}
                  />
                  <label
                    htmlFor={day.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Horário de Abertura</Label>
              <Input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                onBlur={() => handleSettingsUpdate('opening_time', openingTime ? `${openingTime}:00` : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário de Fechamento</Label>
              <Input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                onBlur={() => handleSettingsUpdate('closing_time', closingTime ? `${closingTime}:00` : null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Informações do Negócio
          </CardTitle>
          <CardDescription>
            Dados da sua conta e contato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome do Negócio</Label>
              <Input value={client.business_name} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input 
                value={client.is_active ? 'Ativo' : 'Inativo'} 
                readOnly 
                className="bg-muted" 
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Telefone de Contato</Label>
              <Input
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                onBlur={() => handleClientUpdate('business_phone', businessPhone || null)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail de Contato</Label>
              <Input
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                onBlur={() => handleClientUpdate('business_email', businessEmail || null)}
                placeholder="contato@seunegocio.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição do Negócio</Label>
            <Textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              onBlur={() => handleClientUpdate('business_description', businessDescription || null)}
              placeholder="Descreva seu negócio..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
