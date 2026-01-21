import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Client } from '@/hooks/useClient';
import { Button } from '@/components/ui/button';
import { NotificationBadge } from './NotificationBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotSelector } from '@/components/bots/BotSelector';
import conversyLogo from '@/assets/conversy-logo.png';
import conversyIcon from '@/assets/conversy-icon.png';
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
  Target,
  ChevronLeft,
  ChevronRight,
  Boxes
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
  { icon: Boxes, label: 'Meus Bots', path: '/dashboard/bots' },
  { icon: Smartphone, label: 'Simulador', path: '/dashboard/simulator' },
  { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
];

export const Sidebar = ({ client }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) {
        return stored === 'dark';
      }
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

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
          isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0',
          !isMobileOpen && (isCollapsed ? 'md:w-16' : 'md:w-64')
        )}
      >
        <div className="flex flex-col h-full p-2 md:p-4">
          {/* Logo Conversy */}
          <div 
            className={cn(
              "flex items-center mb-4 pb-4 border-b border-sidebar-border",
              isCollapsed ? "justify-center" : "px-2"
            )}
            data-tour="sidebar-logo"
          >
            <img 
              src={isCollapsed ? conversyIcon : conversyLogo} 
              alt="Conversy" 
              className={cn(
                "object-contain",
                isCollapsed ? "h-8 w-8" : "h-8"
              )}
            />
          </div>

          {/* Bot Selector */}
          <BotSelector isCollapsed={isCollapsed} />

          {/* Collapse Toggle - Desktop only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex self-end mb-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>

          {/* Navigation */}
          <ScrollArea className="flex-1 -mx-2 px-2">
            <nav className="space-y-1">
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
                      'w-full h-10 md:h-11',
                      isCollapsed ? 'justify-center px-2' : 'justify-start gap-3 px-3',
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                    )}
                    onClick={() => handleNavigate(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    {...(tourAttr ? { 'data-tour': tourAttr } : {})}
                  >
                    <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className={cn(
              "h-10 md:h-11 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 mb-2",
              isCollapsed ? "justify-center px-2 w-full" : "justify-start gap-3 w-full"
            )}
            onClick={toggleTheme}
            title={isCollapsed ? (isDark ? 'Modo Claro' : 'Modo Escuro') : undefined}
          >
            {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!isCollapsed && (isDark ? 'Modo Claro' : 'Modo Escuro')}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            className={cn(
              "h-10 md:h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              isCollapsed ? "justify-center px-2 w-full" : "justify-start gap-3 w-full"
            )}
            onClick={handleLogout}
            title={isCollapsed ? 'Sair' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && 'Sair'}
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
