import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  ArrowLeft,
  LogOut,
  ShoppingCart,
  DollarSign,
  Settings,
  FileText,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Clientes", path: "/admin/clients" },
  { icon: ShoppingCart, label: "Pedidos", path: "/admin/orders" },
  { icon: DollarSign, label: "Financeiro", path: "/admin/financials" },
  { icon: CreditCard, label: "Assinaturas", path: "/admin/subscriptions" },
  { icon: BarChart3, label: "Estatísticas", path: "/admin/stats" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
  { icon: FileText, label: "Auditoria", path: "/admin/audit" },
  { icon: Shield, label: "Administradores", path: "/admin/users" },
];

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Gerenciamento do Sistema</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
};
