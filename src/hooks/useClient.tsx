import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Re-export BotMessage from dedicated hook
export type { BotMessage } from './useBotMessages';
export { 
  useBotMessages, 
  useUpdateBotMessage, 
  useCreateBotMessage, 
  useDeleteBotMessage 
} from './useBotMessages';

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
  onboarding_completed: boolean;
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

// useBotMessages moved to useBotMessages.tsx

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

// useUpdateBotMessage moved to useBotMessages.tsx

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
