import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Inicial",
    price: "0",
    desc: "Para validar a ideia.",
    features: ["1 Bot", "Taxa 2%", "Suporte Email"],
    popular: false,
  },
  {
    name: "Profissional",
    price: "97",
    desc: "O plano favorito dos produtores.",
    features: ["5 Bots", "Taxa 0.5%", "Recuperação", "Upsell"],
    popular: true,
  },
  {
    name: "Empresa",
    price: "247",
    desc: "Foco total em escala.",
    features: ["Bots Ilimitados", "Taxa 0%", "Whitelabel", "Suporte 24/7"],
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
    <section id="preços" className="py-24 px-4 relative bg-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Planos & Preços
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Comece grátis e escale conforme seu negócio cresce.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
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
                  <h3 className="text-xl font-display font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm font-body text-muted-foreground mb-4">{plan.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-5xl font-display font-bold">{plan.price}</span>
                  </div>

                  <div className="flex-1 space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" strokeWidth={2} />
                        </div>
                        <span className="font-body text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/auth" className="block">
                    <Button className={`w-full gap-2 h-12 rounded-xl font-display font-medium ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cta-shine"
                        : "bg-white/5 hover:bg-white/10 text-foreground border border-white/10"
                    }`}>
                      Selecionar {plan.name}
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
