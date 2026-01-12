import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface MessageButton {
  text: string;
  type: 'callback' | 'url';
  value: string;
}

export interface BotMessage {
  id: string;
  client_id: string;
  bot_id: string | null;
  message_type: string;
  message_content: string;
  is_active: boolean;
  display_order: number;
  media_url: string | null;
  media_type: string | null;
  buttons: MessageButton[] | null;
  created_at: string;
  updated_at: string;
}

// Helper to safely parse buttons from Json to MessageButton[]
function parseButtons(buttons: Json | null): MessageButton[] | null {
  if (!buttons) return null;
  if (!Array.isArray(buttons)) return null;
  return buttons as unknown as MessageButton[];
}

export const useBotMessages = (clientId: string | undefined, botId?: string | null) => {
  return useQuery({
    queryKey: ['bot_messages', clientId, botId],
    queryFn: async () => {
      let query = supabase
        .from('bot_messages')
        .select('*')
        .eq('client_id', clientId!);

      // Filter by bot_id if provided
      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data, error } = await query
        .order('message_type')
        .order('display_order');

      if (error) throw error;
      
      // Transform the data to properly type buttons
      return (data || []).map(msg => ({
        ...msg,
        buttons: parseButtons(msg.buttons),
      })) as BotMessage[];
    },
    enabled: !!clientId,
  });
};

export const useUpdateBotMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      message_content, 
      is_active, 
      media_url, 
      media_type,
      buttons,
    }: { 
      id: string; 
      message_content?: string; 
      is_active?: boolean;
      media_url?: string | null;
      media_type?: string | null;
      buttons?: MessageButton[] | null;
    }) => {
      const updates: Record<string, unknown> = {};
      if (message_content !== undefined) updates.message_content = message_content;
      if (is_active !== undefined) updates.is_active = is_active;
      if (media_url !== undefined) updates.media_url = media_url;
      if (media_type !== undefined) updates.media_type = media_type;
      if (buttons !== undefined) updates.buttons = buttons;

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

export const useCreateBotMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      client_id, 
      bot_id,
      message_type, 
      message_content, 
      display_order,
      media_url,
      media_type,
      buttons,
    }: { 
      client_id: string; 
      bot_id?: string | null;
      message_type: string; 
      message_content: string; 
      display_order: number;
      media_url?: string | null;
      media_type?: string | null;
      buttons?: MessageButton[] | null;
    }) => {
      const { data, error } = await supabase
        .from('bot_messages')
        .insert({
          client_id,
          bot_id: bot_id || null,
          message_type,
          message_content,
          display_order,
          is_active: true,
          media_url: media_url || null,
          media_type: media_type || null,
          buttons: (buttons || []) as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_messages'] });
    },
  });
};

export const useDeleteBotMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bot_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_messages'] });
    },
  });
};

export const useReorderBotMessages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messages: { id: string; display_order: number }[]) => {
      for (const msg of messages) {
        const { error } = await supabase
          .from('bot_messages')
          .update({ display_order: msg.display_order })
          .eq('id', msg.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_messages'] });
    },
  });
};
