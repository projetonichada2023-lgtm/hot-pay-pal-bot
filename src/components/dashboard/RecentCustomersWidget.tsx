import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentCustomersWidgetProps {
  clientId: string;
  botId?: string | null;
}

export const RecentCustomersWidget = ({ clientId, botId }: RecentCustomersWidgetProps) => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['recent-customers', clientId, botId],
    queryFn: async () => {
      let query = supabase
        .from('telegram_customers')
        .select('id, first_name, last_name, telegram_username, created_at')
        .eq('client_id', clientId);

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

  const getDisplayName = (firstName?: string | null, lastName?: string | null, username?: string | null) => {
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }
    return username || 'Usuário';
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-telegram" />
          <CardTitle className="text-base">Clientes Recentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : !customers || customers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum cliente cadastrado
          </p>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-telegram/20 text-telegram text-xs">
                    {getInitials(customer.first_name, customer.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getDisplayName(customer.first_name, customer.last_name, customer.telegram_username)}
                  </p>
                  {customer.telegram_username && (
                    <p className="text-xs text-muted-foreground truncate">
                      @{customer.telegram_username}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(customer.created_at!), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
