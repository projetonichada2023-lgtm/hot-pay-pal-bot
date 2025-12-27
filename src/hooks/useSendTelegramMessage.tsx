import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendMessageParams {
  clientId: string;
  chatId: number;
  customerId?: string | null;
  message?: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video' | 'document';
}

export function useSendTelegramMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, chatId, customerId, message, mediaUrl, mediaType }: SendMessageParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Não autenticado');
      }

      const response = await supabase.functions.invoke('send-telegram-message', {
        body: {
          clientId,
          chatId,
          customerId,
          message,
          mediaUrl,
          mediaType,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao enviar mensagem');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Erro ao enviar mensagem');
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['telegram-conversations', variables.clientId] });
    },
  });
}

export async function uploadChatMedia(file: File, clientId: string): Promise<{ url: string; type: 'photo' | 'video' | 'document' }> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const fileName = `${clientId}/chat-${Date.now()}.${fileExt}`;
  
  // Determine media type
  let mediaType: 'photo' | 'video' | 'document' = 'document';
  if (file.type.startsWith('image/')) {
    mediaType = 'photo';
  } else if (file.type.startsWith('video/')) {
    mediaType = 'video';
  }

  const { data, error } = await supabase.storage
    .from('bot-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('bot-media')
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    type: mediaType,
  };
}
