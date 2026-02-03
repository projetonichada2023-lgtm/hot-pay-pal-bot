import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";

const mockupVariants = {
  hidden: {
    opacity: 0,
    y: 100,
    rotateX: 25,
    rotateY: -20,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 8,
    rotateY: -12,
    scale: 1,
    transition: {
      duration: 1.2,
      delay: 0.8,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

const metrics = [
  { icon: DollarSign, label: "Receita", value: "R$12.5k", change: "+23%", color: "text-primary" },
  { icon: ShoppingCart, label: "Pedidos", value: "127", change: "+18%", color: "text-emerald-400" },
  { icon: TrendingUp, label: "Conversão", value: "34.2%", change: "+5%", color: "text-blue-400" },
  { icon: Users, label: "Clientes", value: "89", change: "+12%", color: "text-purple-400" },
];

// Static SVG chart path representing sales data
const chartPath = "M0,80 Q20,70 40,75 T80,60 T120,65 T160,45 T200,50 T240,30 T280,35 T320,20 T360,25 T400,15";

export function DashboardMockup() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="dashboard-mockup-container hidden md:block mt-12 lg:mt-16">
      <motion.div
        className="dashboard-mockup relative mx-auto max-w-4xl"
        variants={mockupVariants}
        initial="hidden"
        animate="visible"
        {...(!shouldReduceMotion && {
          animate: {
            y: [-5, 5, -5],
            rotateX: [8, 6, 8],
            rotateY: [-12, -10, -12],
          },
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }
        })}
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform"
        }}
      >
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-2xl opacity-60" />
        
        {/* Main dashboard container */}
        <div className="relative bg-[rgba(10,10,10,0.9)] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 lg:p-6 shadow-2xl">
          {/* Top shine effect */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Browser-like header */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white/[0.04] rounded-md h-6 max-w-xs mx-auto flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground font-mono">app.conversy.com.br/dashboard</span>
              </div>
            </div>
          </div>
          
          {/* Metric cards grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.05] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} strokeWidth={1.5} />
                  <span className="text-[10px] text-emerald-400 font-medium">{metric.change}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-0.5">{metric.label}</p>
                <p className="text-sm lg:text-base font-bold text-foreground">{metric.value}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Chart area */}
          <motion.div
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-foreground">Vendas da Semana</span>
              <span className="text-[10px] text-muted-foreground">Últimos 7 dias</span>
            </div>
            <svg 
              viewBox="0 0 400 100" 
              className="w-full h-20 lg:h-24"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Fill area */}
              <path
                d={`${chartPath} L400,100 L0,100 Z`}
                fill="url(#chartGradient)"
              />
              {/* Line */}
              <path
                d={chartPath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
              />
              {/* Animated dot at the end */}
              <motion.circle
                cx="400"
                cy="15"
                r="4"
                fill="hsl(var(--primary))"
                className="drop-shadow-[0_0_8px_hsl(var(--primary))]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>
          </motion.div>
          
          {/* Bottom panels */}
          <div className="grid grid-cols-2 gap-3">
            {/* Recent orders */}
            <motion.div
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 }}
            >
              <span className="text-xs font-medium text-foreground mb-2 block">Pedidos Recentes</span>
              <div className="space-y-2">
                {[
                  { name: "Curso Python", value: "R$97", status: "paid" },
                  { name: "Ebook Marketing", value: "R$47", status: "paid" },
                  { name: "Mentoria Pro", value: "R$297", status: "pending" },
                ].map((order, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'paid' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{order.name}</span>
                    </div>
                    <span className="text-[10px] font-medium text-foreground">{order.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Top products */}
            <motion.div
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 }}
            >
              <span className="text-xs font-medium text-foreground mb-2 block">Produtos Top</span>
              <div className="space-y-2">
                {[
                  { name: "Curso Completo", sales: 45, percent: 100 },
                  { name: "Ebook Premium", sales: 32, percent: 71 },
                  { name: "Template Pack", sales: 28, percent: 62 },
                ].map((product, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{product.name}</span>
                      <span className="text-[10px] font-medium text-foreground">{product.sales}</span>
                    </div>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${product.percent}%` }}
                        transition={{ delay: 2 + i * 0.2, duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
