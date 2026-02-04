import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Client } from '@/hooks/useClient';
import { Button } from '@/components/ui/button';
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
  Boxes,
  Wallet
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
  { icon: Wallet, label: 'Financeiro', path: '/dashboard/balance' },
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
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm border border-border/50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-40 h-screen bg-black border-r border-border/50 transition-all duration-300',
          isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0',
          !isMobileOpen && (isCollapsed ? 'md:w-16' : 'md:w-64')
        )}
      >
        <div className="flex flex-col h-full p-3 md:p-4">
          {/* Logo Conversy */}
          <div 
            className={cn(
              "flex items-center mb-6 pb-4 border-b border-border/30",
              isCollapsed ? "justify-center" : "px-1"
            )}
            data-tour="sidebar-logo"
          >
            <img 
              src={isCollapsed ? conversyIcon : conversyLogo} 
              alt="Conversy" 
              className={cn(
                "object-contain",
                isCollapsed ? "h-8 w-8" : "h-7"
              )}
            />
          </div>

          {/* Bot Selector */}
          <BotSelector isCollapsed={isCollapsed} />

          {/* Collapse Toggle - Desktop only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex self-end mb-3 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" strokeWidth={1.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />}
          </Button>

          {/* Navigation */}
          <ScrollArea className="flex-1 -mx-2 px-2">
            <nav className="space-y-0.5">
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
                      'w-full h-10 transition-all duration-200',
                      isCollapsed ? 'justify-center px-2' : 'justify-start gap-3 px-3',
                      isActive 
                        ? 'bg-primary/10 text-primary border-l-2 border-primary rounded-l-none' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l-2 border-transparent'
                    )}
                    onClick={() => handleNavigate(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    {...(tourAttr ? { 'data-tour': tourAttr } : {})}
                  >
                    <item.icon className={cn('w-[18px] h-[18px] shrink-0', isActive && 'text-primary')} strokeWidth={1.5} />
                    {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Bottom Actions */}
          <div className="pt-4 mt-4 border-t border-border/30 space-y-1">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              className={cn(
                "h-10 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200",
                isCollapsed ? "justify-center px-2 w-full" : "justify-start gap-3 w-full"
              )}
              onClick={toggleTheme}
              title={isCollapsed ? (isDark ? 'Modo Claro' : 'Modo Escuro') : undefined}
            >
              {isDark ? <Sun className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} /> : <Moon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />}
              {!isCollapsed && <span className="text-sm font-medium">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              className={cn(
                "h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200",
                isCollapsed ? "justify-center px-2 w-full" : "justify-start gap-3 w-full"
              )}
              onClick={handleLogout}
              title={isCollapsed ? 'Sair' : undefined}
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
              {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
