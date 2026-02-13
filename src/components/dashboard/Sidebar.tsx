import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Client, useClientSettings } from '@/hooks/useClient';
import { useClientBalance } from '@/hooks/useClientBalance';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotSelector } from '@/components/bots/BotSelector';
import conversyLogo from '@/assets/conversy-logo.png';
import conversyIcon from '@/assets/conversy-icon.png';
import unipayLogo from '@/assets/unipay-logo.png';
import duttyfyLogo from '@/assets/duttyfy-logo.png';
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
  Wallet,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  client: Client;
}

const menuGroups = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: MessageCircle, label: 'Conversas', path: '/dashboard/chats' },
    ]
  },
  {
    label: 'Vendas',
    items: [
      { icon: MessageSquare, label: 'Mensagens Bot', path: '/dashboard/messages' },
      { icon: Package, label: 'Produtos', path: '/dashboard/products' },
      { icon: GitBranch, label: 'Funil', path: '/dashboard/funnel' },
      { icon: ShoppingCart, label: 'Pedidos', path: '/dashboard/orders' },
      { icon: RefreshCw, label: 'Recuperação', path: '/dashboard/recovery' },
    ]
  },
  {
    label: 'Análise',
    items: [
      { icon: Users, label: 'Clientes', path: '/dashboard/customers' },
      { icon: Target, label: 'Tracking', path: '/dashboard/tracking' },
      { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports' },
    ]
  },
  {
    label: 'Gestão',
    items: [
      { icon: Wallet, label: 'Financeiro', path: '/dashboard/balance' },
      { icon: UserPlus, label: 'Afiliados', path: '/affiliate' },
      { icon: Boxes, label: 'Meus Bots', path: '/dashboard/bots' },
      { icon: Smartphone, label: 'Simulador', path: '/dashboard/simulator' },
      { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
    ]
  },
];

const getTourAttribute = (path: string) => {
  if (path === '/dashboard/products') return 'menu-products';
  if (path === '/dashboard/bot-config') return 'menu-bot-config';
  if (path === '/dashboard/funnel') return 'menu-funnel';
  if (path === '/dashboard/messages') return 'menu-messages';
  if (path === '/dashboard/recovery') return 'menu-recovery';
  return undefined;
};

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
      if (stored) return stored === 'dark';
      return true;
    }
    return true;
  });
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: balance } = useClientBalance(client?.id);
  const { data: settings } = useClientSettings(client?.id);

  const debtAmount = Number(balance?.debt_amount) || 0;
  const activeGateway = (settings as any)?.active_payment_gateway || null;
  const hasUnipayKey = !!(settings as any)?.fastsoft_api_key;
  const hasDuttyfyKey = !!(settings as any)?.duttyfy_api_key;

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
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" strokeWidth={1.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />}
          </Button>

          {/* Navigation with Groups */}
          <ScrollArea className="flex-1 -mx-2 px-2">
            <nav className="space-y-4">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  {/* Group Label */}
                  {!isCollapsed && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1.5">
                      {group.label}
                    </p>
                  )}
                  {isCollapsed && (
                    <div className="h-px bg-border/20 mx-2 mb-1.5" />
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const tourAttr = getTourAttribute(item.path);
                      const isFinanceiro = item.path === '/dashboard/balance';

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
                          {!isCollapsed && (
                            <span className="text-sm font-medium truncate flex-1 text-left">{item.label}</span>
                          )}
                          {/* Debt badge on Financeiro */}
                          {isFinanceiro && debtAmount > 0 && !isCollapsed && (
                            <span className="text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full leading-none">
                              R${debtAmount.toFixed(0)}
                            </span>
                          )}
                          {isFinanceiro && debtAmount > 0 && isCollapsed && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Gateway Status */}
          <div 
            className={cn(
              "pt-3 mt-3 border-t border-border/30 cursor-pointer",
              isCollapsed ? "px-0" : "px-1"
            )}
            onClick={() => handleNavigate('/dashboard/settings?tab=pagamentos')}
            title={isCollapsed ? `Gateway: ${activeGateway === 'duttyfy' ? 'DuttyFy' : activeGateway === 'unipay' ? 'UniPay' : 'Nenhum'}` : undefined}
          >
            {isCollapsed ? (
              <div className="flex justify-center">
                {activeGateway === 'duttyfy' ? (
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-white/10 flex items-center justify-center border border-border/30">
                    <img src={duttyfyLogo} alt="DuttyFy" className="w-5 h-5 object-contain" />
                  </div>
                ) : activeGateway === 'unipay' ? (
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-white/10 flex items-center justify-center border border-border/30">
                    <img src={unipayLogo} alt="UniPay" className="w-5 h-5 object-contain" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center border border-border/30">
                    <CreditCard className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors">
                {activeGateway === 'duttyfy' ? (
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-white/10 flex items-center justify-center border border-border/30 shrink-0">
                    <img src={duttyfyLogo} alt="DuttyFy" className="w-5 h-5 object-contain" />
                  </div>
                ) : activeGateway === 'unipay' ? (
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-white/10 flex items-center justify-center border border-border/30 shrink-0">
                    <img src={unipayLogo} alt="UniPay" className="w-5 h-5 object-contain" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center border border-border/30 shrink-0">
                    <CreditCard className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Gateway</span>
                  <span className="text-xs font-medium text-foreground truncate">
                    {activeGateway === 'duttyfy' ? 'DuttyFy' : activeGateway === 'unipay' ? 'UniPay' : 'Não configurado'}
                  </span>
                </div>
                {activeGateway && (
                  <div className="w-2 h-2 rounded-full bg-green-500 ml-auto shrink-0" />
                )}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 mt-4 border-t border-border/30 space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "h-10 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200",
                isCollapsed ? "justify-center px-2 w-full" : "justify-start gap-3 w-full"
              )}
              onClick={() => setIsDark(!isDark)}
              title={isCollapsed ? (isDark ? 'Modo Claro' : 'Modo Escuro') : undefined}
            >
              {isDark ? <Sun className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} /> : <Moon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />}
              {!isCollapsed && <span className="text-sm font-medium">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </Button>

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
