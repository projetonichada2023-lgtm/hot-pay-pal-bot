import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Crown, 
  Zap, 
  Sparkles,
  ArrowRight,
  Package,
  ShoppingCart,
  MessageSquare,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    description: "Para começar a vender",
    popular: false,
    transactionFee: "R$ 0,80",
    features: [
      { text: "1 bot", included: true },
      { text: "Sem upsell", included: false },
      { text: "R$ 0,80 por transação", included: true },
      { text: "Mensagens básicas", included: true },
      { text: "Suporte por email", included: true },
    ],
    gradient: "from-zinc-500/20 to-zinc-600/20",
    iconGradient: "from-zinc-400 to-zinc-500",
  },
  {
    id: "basic",
    name: "Básico",
    price: 49.90,
    description: "Para pequenos negócios",
    popular: false,
    transactionFee: "R$ 0,60",
    features: [
      { text: "2 bots", included: true },
      { text: "500 pedidos/mês", included: true },
      { text: "2 upsells por produto", included: true },
      { text: "Interface de taxas", included: true },
      { text: "R$ 0,60 por transação", included: true },
      { text: "Mensagens personalizadas", included: true },
    ],
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconGradient: "from-blue-400 to-cyan-500",
  },
  {
    id: "pro",
    name: "Profissional",
    price: 99.90,
    description: "Para escalar suas vendas",
    popular: true,
    transactionFee: "R$ 0,50",
    features: [
      { text: "5 bots", included: true },
      { text: "Pedidos ilimitados", included: true },
      { text: "Upsell ilimitado", included: true },
      { text: "R$ 0,50 por transação", included: true },
      { text: "Recuperação de carrinho", included: true },
      { text: "Relatórios avançados", included: true },
      { text: "Suporte prioritário", included: true },
    ],
    gradient: "from-primary/20 to-orange-500/20",
    iconGradient: "from-primary to-orange-500",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    description: "Solução personalizada",
    popular: false,
    transactionFee: "Personalizado",
    features: [
      { text: "Bots ilimitados", included: true },
      { text: "Pedidos ilimitados", included: true },
      { text: "Upsell ilimitado", included: true },
      { text: "Taxa personalizada", included: true },
      { text: "Suporte prioritário 24/7", included: true },
      { text: "Gerente de conta dedicado", included: true },
    ],
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconGradient: "from-amber-400 to-yellow-500",
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 px-4 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Crown className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-body text-primary">Planos & Preços</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Escolha o Plano Ideal
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Comece grátis e escale conforme seu negócio cresce. Sem surpresas, sem taxas escondidas.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={staggerItem}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group h-full"
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-display font-medium shadow-lg shadow-primary/30"
                    >
                      <Sparkles className="w-3 h-3" />
                      Mais Popular
                    </motion.div>
                  </div>
                )}

                {/* Card glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Card */}
                <div className={`landing-feature-card relative rounded-3xl h-full flex flex-col ${plan.popular ? 'ring-1 ring-primary/30' : ''}`}>
                  {/* Header */}
                  <div className="text-center pb-6 border-b border-white/5">
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${plan.iconGradient} flex items-center justify-center mb-4 shadow-lg`}>
                      {plan.id === "free" && <Package className="w-7 h-7 text-white" strokeWidth={1.5} />}
                      {plan.id === "basic" && <ShoppingCart className="w-7 h-7 text-white" strokeWidth={1.5} />}
                      {plan.id === "pro" && <Zap className="w-7 h-7 text-white" strokeWidth={1.5} />}
                      {plan.id === "enterprise" && <Crown className="w-7 h-7 text-white" strokeWidth={1.5} />}
                    </div>
                    
                    <h3 className="text-xl font-display font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm font-body text-muted-foreground mb-4">{plan.description}</p>
                    
                    <div className="flex items-baseline justify-center gap-1">
                      {plan.price !== null ? (
                        <>
                          <span className="text-sm text-muted-foreground font-body">R$</span>
                          <span className="text-4xl font-display font-bold">{plan.price.toFixed(2).replace(".", ",")}</span>
                          <span className="text-muted-foreground font-body">/mês</span>
                        </>
                      ) : (
                        <span className="text-2xl font-display font-bold text-muted-foreground">Sob consulta</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 py-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <motion.div
                        key={feature.text}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-3 text-sm ${feature.included ? '' : 'opacity-40'}`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          feature.included 
                            ? 'bg-emerald-500/20' 
                            : 'bg-white/5'
                        }`}>
                          <Check className={`w-3 h-3 ${feature.included ? 'text-emerald-400' : 'text-muted-foreground'}`} strokeWidth={2} />
                        </div>
                        <span className="font-body">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-white/5">
                    <Link to="/auth" className="block">
                      <Button 
                        className={`w-full gap-2 h-12 rounded-xl font-display font-medium transition-all duration-300 ${
                          plan.popular 
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cta-shine' 
                            : 'bg-white/5 hover:bg-white/10 text-foreground border border-white/10'
                        }`}
                      >
                        {plan.id === "enterprise" ? "Falar com Vendas" : "Começar Agora"}
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-6 text-sm font-body text-muted-foreground flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              <span>Cancele quando quiser</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              <span>Suporte via Telegram</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              <span>Ativação instantânea</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
