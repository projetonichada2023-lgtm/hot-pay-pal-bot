import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Client } from '@/hooks/useClient';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Button } from '@/components/ui/button';
import { NotificationBadge } from './NotificationBadge';
import { 
  LayoutDashboard, 
  MessageSquare, 
  MessageCircle,
  Settings, 
  Package, 
  Users, 
  ShoppingCart,
  Bot,
  LogOut,
  Menu,
  X,
  GitBranch,
  BarChart3,
  Bell
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

interface SidebarProps {
  client: Client;
}

export const Sidebar = ({ client }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, counts, clearOrdersCount, clearChatsCount, markAllAsRead } = useRealtimeNotifications(client.id);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', badge: 0 },
    { icon: MessageCircle, label: 'Conversas', path: '/chats', badge: counts.chats },
    { icon: MessageSquare, label: 'Mensagens Bot', path: '/messages', badge: 0 },
    { icon: Package, label: 'Produtos', path: '/products', badge: 0 },
    { icon: GitBranch, label: 'Funil', path: '/funnel', badge: 0 },
    { icon: ShoppingCart, label: 'Pedidos', path: '/orders', badge: counts.orders },
    { icon: Users, label: 'Clientes', path: '/customers', badge: 0 },
    { icon: BarChart3, label: 'Relatórios', path: '/reports', badge: 0 },
    { icon: Bot, label: 'Bot Config', path: '/bot-config', badge: 0 },
    { icon: Settings, label: 'Configurações', path: '/settings', badge: 0 },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigate = (path: string) => {
    if (path === '/orders') {
      clearOrdersCount();
    } else if (path === '/chats') {
      clearChatsCount();
    }
    navigate(path);
    setIsCollapsed(false);
  };

  const totalNotifications = counts.orders + counts.chats;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="w-4 h-4 text-primary" />;
      case 'payment_received':
        return <span className="text-success">💰</span>;
      case 'order_delivered':
        return <span className="text-telegram">📦</span>;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          isCollapsed ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64',
          'md:w-64'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-4 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-hot flex items-center justify-center glow-hot">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground truncate">{client.business_name}</h2>
              <p className="text-xs text-muted-foreground truncate">
                {client.telegram_bot_username ? `@${client.telegram_bot_username}` : 'Bot não configurado'}
              </p>
            </div>
          </div>

          {/* Notifications Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 mb-2 relative"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <NotificationBadge count={totalNotifications} />
                </div>
                <span>Notificações</span>
                {totalNotifications > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {totalNotifications} nova{totalNotifications > 1 ? 's' : ''}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start" side="right">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <h4 className="font-semibold text-sm">Notificações</h4>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <Bell className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-3 hover:bg-secondary/50 transition-colors cursor-pointer',
                          !notification.read && 'bg-primary/5'
                        )}
                        onClick={() => {
                          if (notification.type === 'new_order' || notification.type === 'payment_received') {
                            handleNavigate('/orders');
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(notification.createdAt, { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-11 relative',
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => handleNavigate(item.path)}
                >
                  <div className="relative">
                    <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                    <NotificationBadge count={item.badge} />
                  </div>
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}
    </>
  );
};
