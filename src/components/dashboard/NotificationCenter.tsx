import { useState } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Button } from '@/components/ui/button';
import { NotificationBadge } from './NotificationBadge';
import { 
  Bell, 
  ShoppingCart,
  Volume2,
  VolumeX,
  BellRing,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  clientId: string;
  onNavigate?: (path: string) => void;
}

export const NotificationCenter = ({ clientId, onNavigate }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    counts, 
    soundEnabled,
    browserNotificationsEnabled,
    clearOrdersCount, 
    markAllAsRead,
    toggleSound,
    enableBrowserNotifications,
  } = useRealtimeNotifications(clientId);

  const totalNotifications = counts.orders;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="w-4 h-4 text-primary" />;
      case 'payment_received':
        return <span className="text-success">💰</span>;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const handleNotificationClick = (type: string) => {
    if (type === 'new_order' || type === 'payment_received') {
      clearOrdersCount();
      onNavigate?.('/orders');
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50 md:top-6 md:right-6" data-tour="notifications">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "relative h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm border-border/50 shadow-lg",
              "hover:bg-card hover:border-primary/50 transition-all",
              totalNotifications > 0 && "animate-pulse-glow"
            )}
          >
            <Bell className={cn(
              "w-5 h-5 transition-colors",
              totalNotifications > 0 ? "text-primary" : "text-muted-foreground"
            )} />
            <NotificationBadge count={totalNotifications} className="top-0 right-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[calc(100vw-2rem)] sm:w-96 p-0 mr-2 sm:mr-0" 
          align="end" 
          sideOffset={8}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h4 className="font-semibold text-sm">Notificações</h4>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleSound}
                title={soundEnabled ? 'Som ativado' : 'Som desativado'}
                aria-label={soundEnabled ? 'Som ativado' : 'Som desativado'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-success" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={enableBrowserNotifications}
                title={
                  browserNotificationsEnabled
                    ? 'Notificações do navegador ativadas'
                    : 'Ativar notificações do navegador'
                }
                aria-label={
                  browserNotificationsEnabled
                    ? 'Notificações do navegador ativadas'
                    : 'Ativar notificações do navegador'
                }
              >
                <BellRing
                  className={cn(
                    'w-4 h-4',
                    browserNotificationsEnabled ? 'text-success' : 'text-muted-foreground'
                  )}
                />
              </Button>
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead} 
                  className="text-xs h-8 px-2"
                >
                  Limpar
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:hidden"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="h-[60vh] sm:h-[350px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Bell className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">Nenhuma notificação</p>
                <p className="text-xs mt-1">Você será notificado sobre pedidos e pagamentos</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:bg-secondary',
                      !notification.read && 'bg-primary/5'
                    )}
                    onClick={() => handleNotificationClick(notification.type)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5 opacity-70">
                          {formatDistanceToNow(notification.createdAt, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
