import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Client } from '@/hooks/useClient';
import { Button } from '@/components/ui/button';
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
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  client: Client;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: MessageCircle, label: 'Conversas', path: '/chats' },
  { icon: MessageSquare, label: 'Mensagens Bot', path: '/messages' },
  { icon: Package, label: 'Produtos', path: '/products' },
  { icon: GitBranch, label: 'Funil', path: '/funnel' },
  { icon: ShoppingCart, label: 'Pedidos', path: '/orders' },
  { icon: Users, label: 'Clientes', path: '/customers' },
  { icon: Bot, label: 'Bot Config', path: '/bot-config' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export const Sidebar = ({ client }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
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
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
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

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-11',
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setIsCollapsed(false);
                  }}
                >
                  <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
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
