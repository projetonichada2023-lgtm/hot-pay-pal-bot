import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientBot {
  id: string;
  client_id: string;
  name: string;
  telegram_bot_token: string | null;
  telegram_bot_username: string | null;
  webhook_configured: boolean;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export type ClientBotInsert = Omit<ClientBot, 'id' | 'created_at' | 'updated_at'>;
export type ClientBotUpdate = Partial<Omit<ClientBot, 'id' | 'client_id' | 'created_at' | 'updated_at'>>;

export const useClientBots = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['client_bots', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('client_bots')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ClientBot[];
    },
    enabled: !!clientId,
  });
};

export const usePrimaryBot = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['primary_bot', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .from('client_bots')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) throw error;
      return data as ClientBot | null;
    },
    enabled: !!clientId,
  });
};

export const useCreateClientBot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bot: ClientBotInsert) => {
      const { data, error } = await supabase
        .from('client_bots')
        .insert(bot)
        .select()
        .single();

      if (error) throw error;
      return data as ClientBot;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client_bots', data.client_id] });
      toast({
        title: 'Bot criado',
        description: 'O novo bot foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar bot',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateClientBot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, clientId, ...updates }: ClientBotUpdate & { id: string; clientId: string }) => {
      const { data, error } = await supabase
        .from('client_bots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, clientId } as ClientBot & { clientId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client_bots', data.clientId] });
      queryClient.invalidateQueries({ queryKey: ['primary_bot', data.clientId] });
      toast({
        title: 'Bot atualizado',
        description: 'As configurações do bot foram atualizadas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar bot',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteClientBot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase
        .from('client_bots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, clientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client_bots', data.clientId] });
      queryClient.invalidateQueries({ queryKey: ['primary_bot', data.clientId] });
      toast({
        title: 'Bot excluído',
        description: 'O bot foi excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir bot',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useSetPrimaryBot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ botId, clientId }: { botId: string; clientId: string }) => {
      // First, unset all primary flags for this client
      const { error: unsetError } = await supabase
        .from('client_bots')
        .update({ is_primary: false })
        .eq('client_id', clientId);

      if (unsetError) throw unsetError;

      // Then set the new primary bot
      const { data, error } = await supabase
        .from('client_bots')
        .update({ is_primary: true })
        .eq('id', botId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, clientId } as ClientBot & { clientId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client_bots', data.clientId] });
      queryClient.invalidateQueries({ queryKey: ['primary_bot', data.clientId] });
      toast({
        title: 'Bot primário definido',
        description: `${data.name} agora é o bot primário.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao definir bot primário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
