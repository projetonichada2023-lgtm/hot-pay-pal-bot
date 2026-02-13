import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionTag } from "./SectionTag";

const plans = [
  {
    name: "Gratuito",
    price: "0",
    desc: "Para validar a ideia.",
    features: ["1 Bot Ativo", "Taxa R$ 0,80 / venda", "Sem Upsells", "Suporte Email"],
    popular: false,
  },
  {
    name: "Básico",
    price: "49",
    desc: "Para quem está a começar a escalar.",
    features: ["2 Bots Ativos", "500 Pedidos / mês", "2 Upsells", "Taxa R$ 0,60 / venda"],
    popular: false,
  },
  {
    name: "Profissional",
    price: "97",
    desc: "O plano favorito dos produtores.",
    features: ["5 Bots Ativos", "Pedidos Ilimitados", "Upsells Ilimitados", "Taxa R$ 0,50 / venda"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sob Consulta",
    desc: "Solução personalizada para escala.",
    features: ["Bots Ilimitados", "Recursos Ilimitados", "Suporte 24/7 VIP", "Infraestrutura Dedicada"],
    popular: false,
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const PricingSection = () => {
  return (
    <section id="preços" className="py-16 md:py-24 px-4 relative">
      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionTag>Preços</SectionTag>
          <h2 className="text-2xl md:text-5xl mb-3 md:mb-4 font-display font-bold tracking-tight">
            Planos e Preços
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Sem taxas escondidas. Escolha a melhor opção para o seu momento atual.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={staggerItem} className="relative">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group h-full"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-display font-medium shadow-lg shadow-primary/30">
                      <Sparkles className="w-3 h-3" />
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className={`landing-feature-card relative rounded-3xl h-full flex flex-col ${plan.popular ? "ring-1 ring-primary/30" : ""}`}>
                  <h3 className="text-base md:text-xl font-display font-semibold mb-1">{plan.name}</h3>
                  <p className="text-xs font-body text-muted-foreground mb-3 md:mb-4 hidden sm:block">{plan.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mb-4 md:mb-6">
                    {plan.price === "Sob Consulta" ? (
                      <span className="text-lg md:text-2xl font-display font-bold">Sob Consulta</span>
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground">R$</span>
                        <span className="text-3xl md:text-5xl font-display font-bold">{plan.price}</span>
                      </>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" strokeWidth={2} />
                        </div>
                        <span className="font-body text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/auth" className="block">
                    <Button className={`w-full gap-2 h-10 md:h-12 rounded-xl font-display font-medium text-xs md:text-sm uppercase tracking-wide ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cta-shine"
                        : "bg-white/5 hover:bg-white/10 text-foreground border border-white/10"
                    }`}>
                      Escolher Plano
                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
