import { motion } from "framer-motion";
import { Lock, Shield, Headphones, Activity, BadgeCheck } from "lucide-react";
import { ScrollReveal } from "./shared/ScrollReveal";
import { staggerContainer, staggerItem } from "./shared/animations";

const trustItems = [
  { icon: Lock, title: "Dados Criptografados", desc: "SSL 256-bit em todas as transações", color: "emerald" },
  { icon: Shield, title: "LGPD Compliant", desc: "Conformidade total com a lei brasileira", color: "blue" },
  { icon: Headphones, title: "Suporte 24/7", desc: "Atendimento prioritário via Telegram", color: "violet" },
  { icon: Activity, title: "+5.000/dia", desc: "Transações processadas diariamente", color: "amber" },
];

const badges = [
  "Empresa 100% Brasileira",
  "Sem mensalidade fixa",
  "Entrega instantânea garantida",
  "PIX em tempo real"
];

export function TrustSection() {
  return (
    <section className="py-24 px-4 relative bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.015] to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Segurança em Primeiro Lugar
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Seus pagamentos e dados estão protegidos com a mais alta tecnologia.
          </p>
        </ScrollReveal>

        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {trustItems.map((item) => (
            <motion.div
              key={item.title}
              variants={staggerItem}
              className="landing-feature-card flex items-center gap-4 !p-6 rounded-2xl"
            >
              <div className={`w-14 h-14 rounded-xl bg-${item.color}-500/20 flex items-center justify-center shrink-0`}>
                <item.icon className={`w-7 h-7 text-${item.color}-500`} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display font-semibold">{item.title}</p>
                <p className="text-sm font-body text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional trust indicators */}
        <motion.div 
          className="flex flex-wrap justify-center items-center gap-6 mt-12 pt-10 border-t border-white/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {badges.map((badge, index) => (
            <div key={badge} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <BadgeCheck className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
              <span>{badge}</span>
              {index < badges.length - 1 && (
                <div className="hidden md:block w-px h-4 bg-white/10 ml-4" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
