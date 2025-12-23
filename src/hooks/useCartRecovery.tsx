import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CartRecoveryMessage {
  id: string;
  client_id: string;
  delay_minutes: number;
  time_unit: 'minutes' | 'hours' | 'days';
  message_content: string;
  media_url: string | null;
  media_type: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useCartRecovery = (clientId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ["cart-recovery-messages", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from("cart_recovery_messages")
        .select("*")
        .eq("client_id", clientId)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as CartRecoveryMessage[];
    },
    enabled: !!clientId,
  });

  const createMessage = useMutation({
    mutationFn: async (newMessage: Omit<CartRecoveryMessage, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("cart_recovery_messages")
        .insert(newMessage)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-recovery-messages", clientId] });
      toast({
        title: "Mensagem criada",
        description: "A mensagem de recuperação foi criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMessage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CartRecoveryMessage> & { id: string }) => {
      const { data, error } = await supabase
        .from("cart_recovery_messages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-recovery-messages", clientId] });
      toast({
        title: "Mensagem atualizada",
        description: "A mensagem de recuperação foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cart_recovery_messages")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-recovery-messages", clientId] });
      toast({
        title: "Mensagem excluída",
        description: "A mensagem de recuperação foi excluída com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    messages,
    isLoading,
    error,
    createMessage,
    updateMessage,
    deleteMessage,
  };
};