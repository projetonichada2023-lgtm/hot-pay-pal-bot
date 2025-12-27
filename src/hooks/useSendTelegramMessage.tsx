import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendMessageParams {
  clientId: string;
  chatId: number;
  customerId?: string | null;
  message: string;
}

export function useSendTelegramMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, chatId, customerId, message }: SendMessageParams) => {
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
      // Invalidate conversations to refresh the list
      queryClient.invalidateQueries({ queryKey: ['telegram-conversations', variables.clientId] });
    },
  });
}
