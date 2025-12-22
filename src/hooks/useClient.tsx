import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Client {
  id: string;
  user_id: string;
  business_name: string;
  telegram_bot_token: string | null;
  telegram_bot_username: string | null;
  webhook_configured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotMessage {
  id: string;
  client_id: string;
  message_type: string;
  message_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientSettings {
  id: string;
  client_id: string;
  auto_delivery: boolean;
  cart_reminder_enabled: boolean;
  cart_reminder_hours: number;
  upsell_enabled: boolean;
  support_enabled: boolean;
}

export const useClient = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      return data as Client;
    },
    enabled: !!user,
  });
};

export const useBotMessages = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['bot_messages', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bot_messages')
        .select('*')
        .eq('client_id', clientId!)
        .order('message_type');

      if (error) throw error;
      return data as BotMessage[];
    },
    enabled: !!clientId,
  });
};

export const useClientSettings = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['client_settings', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_settings')
        .select('*')
        .eq('client_id', clientId!)
        .single();

      if (error) throw error;
      return data as ClientSettings;
    },
    enabled: !!clientId,
  });
};

export const useUpdateBotMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, message_content, is_active }: { id: string; message_content?: string; is_active?: boolean }) => {
      const updates: Partial<BotMessage> = {};
      if (message_content !== undefined) updates.message_content = message_content;
      if (is_active !== undefined) updates.is_active = is_active;

      const { error } = await supabase
        .from('bot_messages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_messages'] });
    },
  });
};

export const useUpdateClientSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...settings }: Partial<ClientSettings> & { id: string }) => {
      const { error } = await supabase
        .from('client_settings')
        .update(settings)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_settings'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Client> & { id: string }) => {
      const { error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });
};
