import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationTemplate {
  id: string;
  event_type: string;
  title: string;
  body: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('event_type');
      
      if (error) throw error;
      return data as NotificationTemplate[];
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async (template: Partial<NotificationTemplate> & { id: string }) => {
      const { error } = await supabase
        .from('notification_templates')
        .update({
          title: template.title,
          body: template.body,
          icon: template.icon,
          is_active: template.is_active,
        })
        .eq('id', template.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({
        title: 'Template atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleAllNotifications = useMutation({
    mutationFn: async (isActive: boolean) => {
      const { error } = await supabase
        .from('notification_templates')
        .update({ is_active: isActive })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all
      
      if (error) throw error;
    },
    onSuccess: (_, isActive) => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({
        title: isActive ? 'Notificações ativadas' : 'Notificações desativadas',
        description: isActive 
          ? 'Todas as notificações push foram ativadas.' 
          : 'Todas as notificações push foram desativadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    templates,
    isLoading,
    updateTemplate,
    toggleAllNotifications,
  };
};
