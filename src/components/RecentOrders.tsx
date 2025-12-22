import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: "completed" | "pending" | "cancelled";
  time: string;
}

const orders: Order[] = [
  { id: "#4821", customer: "João Silva", product: "Curso Premium", amount: "R$ 297,00", status: "completed", time: "2min" },
  { id: "#4820", customer: "Maria Santos", product: "Ebook Completo", amount: "R$ 47,00", status: "completed", time: "15min" },
  { id: "#4819", customer: "Pedro Costa", product: "Mentoria VIP", amount: "R$ 997,00", status: "pending", time: "32min" },
  { id: "#4818", customer: "Ana Oliveira", product: "Curso Básico", amount: "R$ 97,00", status: "completed", time: "1h" },
  { id: "#4817", customer: "Carlos Lima", product: "Pack Templates", amount: "R$ 27,00", status: "cancelled", time: "2h" },
];

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Pago", class: "text-success bg-success/10" },
  pending: { icon: Clock, label: "Pendente", class: "text-warning bg-warning/10" },
  cancelled: { icon: XCircle, label: "Cancelado", class: "text-destructive bg-destructive/10" },
};

export function RecentOrders() {
  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Pedidos Recentes</h2>
        <button className="text-sm text-primary hover:underline">Ver todos</button>
      </div>

      <div className="space-y-4">
        {orders.map((order, index) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;
          
          return (
            <div 
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {order.customer.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">{order.product}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono font-semibold text-foreground">{order.amount}</span>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  status.class
                )}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{order.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
