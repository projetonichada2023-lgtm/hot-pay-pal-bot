import { DollarSign, ShoppingCart, Users, TrendingUp, Package, CreditCard } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ProductCard } from "./ProductCard";
import { RecentOrders } from "./RecentOrders";

const products = [
  { name: "Curso Marketing Digital", price: "R$ 297,00", sales: 234, views: 1892, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", isHot: true },
  { name: "Ebook Vendas Online", price: "R$ 47,00", sales: 567, views: 3421, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop", isHot: true },
  { name: "Mentoria Premium", price: "R$ 997,00", sales: 45, views: 892, image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop", isHot: false },
  { name: "Pack Templates", price: "R$ 27,00", sales: 892, views: 5678, image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop", isHot: true },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo do seu negócio.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Última atualização</p>
          <p className="text-sm font-medium text-foreground">Agora mesmo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Receita Total" 
          value="R$ 45.231" 
          change="+12.5%"
          changeType="positive"
          icon={DollarSign}
          delay={0}
        />
        <StatsCard 
          title="Vendas" 
          value="1.234" 
          change="+8.2%"
          changeType="positive"
          icon={ShoppingCart}
          delay={50}
        />
        <StatsCard 
          title="Clientes" 
          value="892" 
          change="+23.1%"
          changeType="positive"
          icon={Users}
          delay={100}
        />
        <StatsCard 
          title="Taxa de Conversão" 
          value="4.8%" 
          change="-0.3%"
          changeType="negative"
          icon={TrendingUp}
          delay={150}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Produtos em Alta 🔥</h2>
          <button className="text-sm text-primary hover:underline">Ver todos</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.name} {...product} delay={200 + index * 50} />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <h2 className="text-xl font-bold text-foreground mb-6">Gateways de Pagamento</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Stripe</p>
                <p className="text-sm text-success">Conectado</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-success" />
            </div>
            
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Mercado Pago</p>
                <p className="text-sm text-warning">Pendente</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-warning" />
            </div>
            
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">PIX</p>
                <p className="text-sm text-muted-foreground">Não configurado</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            </div>
          </div>

          <button className="w-full mt-4 p-3 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            + Adicionar Gateway
          </button>
        </div>
      </div>
    </div>
  );
}
