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
  Smartphone
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
        className="fixed top-4 left-4 z-50 md:hidden bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          isMobileOpen ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-72'
        )}
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col h-full p-5">
          {/* Logo */}
          <div className="flex items-center gap-4 px-3 py-5 mb-6" data-tour="sidebar-logo">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-sidebar flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-foreground truncate">{client.business_name}</h2>
              <p className="text-xs text-muted-foreground truncate font-medium">
                {client.telegram_bot_username ? `@${client.telegram_bot_username}` : 'Configurar bot'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-auto pr-1">
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
                    'w-full justify-start gap-3 h-12 rounded-xl font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-primary/10 text-primary border-l-[3px] border-primary hover:bg-primary/15' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  onClick={() => handleNavigate(item.path)}
                  {...(tourAttr ? { 'data-tour': tourAttr } : {})}
                >
                  <item.icon className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="space-y-2 pt-4 border-t border-border/50">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
              onClick={toggleTheme}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isDark ? 'bg-warning/20' : 'bg-primary/20'
              )}>
                {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
              </div>
              {isDark ? 'Modo Claro' : 'Modo Escuro'}
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-medium transition-all"
              onClick={handleLogout}
            >
              <div className="p-1.5 rounded-lg bg-destructive/10">
                <LogOut className="w-4 h-4 text-destructive" />
              </div>
              Sair da conta
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
