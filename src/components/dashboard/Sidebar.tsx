import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Client } from '@/hooks/useClient';
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
  Sun,
  Moon,
  RefreshCw,
  Smartphone,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  client: Client;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageCircle, label: 'Conversas', path: '/dashboard/chats' },
  { icon: MessageSquare, label: 'Mensagens Bot', path: '/dashboard/messages' },
  { icon: Package, label: 'Produtos', path: '/dashboard/products' },
  { icon: GitBranch, label: 'Funil', path: '/dashboard/funnel' },
  { icon: ShoppingCart, label: 'Pedidos', path: '/dashboard/orders' },
  { icon: RefreshCw, label: 'Recuperação', path: '/dashboard/recovery' },
  { icon: Users, label: 'Clientes', path: '/dashboard/customers' },
  { icon: Target, label: 'Tracking', path: '/dashboard/tracking' },
  { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports' },
  { icon: Bot, label: 'Bot Config', path: '/dashboard/bot-config' },
  { icon: Smartphone, label: 'Simulador', path: '/dashboard/simulator' },
  { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
];

export const Sidebar = ({ client }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) {
        return stored === 'dark';
      }
      // Default to dark mode
      return true;
    }
    return true;
  });
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6" data-tour="sidebar-logo">
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
          <nav className="flex-1 space-y-1 overflow-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const getTourAttribute = () => {
                if (item.path === '/dashboard/products') return 'menu-products';
                if (item.path === '/dashboard/bot-config') return 'menu-bot-config';
                if (item.path === '/dashboard/funnel') return 'menu-funnel';
                if (item.path === '/dashboard/messages') return 'menu-messages';
                if (item.path === '/dashboard/recovery') return 'menu-recovery';
                return undefined;
              };
              const tourAttr = getTourAttribute();
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
                  onClick={() => handleNavigate(item.path)}
                  {...(tourAttr ? { 'data-tour': tourAttr } : {})}
                >
                  <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 mb-2"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDark ? 'Modo Claro' : 'Modo Escuro'}
          </Button>

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
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
