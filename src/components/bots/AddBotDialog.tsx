import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Bot, ExternalLink } from 'lucide-react';
import { useCreateClientBot } from '@/hooks/useClientBots';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  telegram_bot_token: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSuccess?: () => void;
}

export const AddBotDialog = ({
  open,
  onOpenChange,
  clientId,
  onSuccess,
}: AddBotDialogProps) => {
  const createBot = useCreateClientBot();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      telegram_bot_token: '',
      is_active: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createBot.mutateAsync({
      client_id: clientId,
      name: values.name,
      telegram_bot_token: values.telegram_bot_token || null,
      telegram_bot_username: null,
      webhook_configured: false,
      is_active: values.is_active,
      is_primary: false,
    });
    
    form.reset();
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Adicionar Novo Bot
          </DialogTitle>
          <DialogDescription>
            Crie um novo bot para gerenciar produtos e clientes separadamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Bot</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Bot TikTok, Bot VIP..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Um nome para identificar este bot no painel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telegram_bot_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token do Bot (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Você pode configurar o token depois na página de configuração do bot.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Bot Ativo</FormLabel>
                    <FormDescription>
                      Bots inativos não processam mensagens.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Como obter o token:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Abra o Telegram e procure por @BotFather</li>
                <li>Envie o comando /newbot</li>
                <li>Siga as instruções para criar seu bot</li>
                <li>Copie o token fornecido</li>
              </ol>
              <a 
                href="https://t.me/botfather" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Abrir @BotFather
              </a>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createBot.isPending}>
                {createBot.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Criar Bot
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
