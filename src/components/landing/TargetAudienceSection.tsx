import { motion } from "framer-motion";
import { TrendingUp, MessageCircle, Shield, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "./shared/ScrollReveal";
import { staggerContainer, staggerItem } from "./shared/animations";

const audiences = [
  {
    icon: TrendingUp,
    title: "Infoprodutores",
    description: "Venda cursos, e-books, mentorias e templates direto no Telegram com entrega automática.",
    items: ["Entrega instantânea de arquivos", "Upsell pós-compra automático", "Métricas de conversão"],
    gradient: "from-violet-500/20 to-purple-500/20",
    iconGradient: "from-violet-500 to-purple-500",
    iconShadow: "shadow-violet-500/25",
    checkColor: "text-violet-400"
  },
  {
    icon: MessageCircle,
    title: "Criadores de Conteúdo",
    description: "Monetize sua audiência vendendo conteúdo exclusivo direto onde ela já está.",
    items: ["Presets e packs exclusivos", "Aulas e tutoriais premium", "Atendimento automatizado"],
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconGradient: "from-cyan-500 to-blue-500",
    iconShadow: "shadow-cyan-500/25",
    checkColor: "text-cyan-400"
  },
  {
    icon: Shield,
    title: "Comunidades VIP",
    description: "Gerencie acessos a grupos exclusivos com cobrança recorrente ou única.",
    items: ["Acesso automático ao grupo", "Gestão de membros integrada", "Renovação e cancelamento"],
    gradient: "from-amber-500/20 to-orange-500/20",
    iconGradient: "from-amber-500 to-orange-500",
    iconShadow: "shadow-amber-500/25",
    checkColor: "text-amber-400"
  }
];

export function TargetAudienceSection() {
  return (
    <section className="py-24 px-4 bg-[#0a0a0a]">
      <div className="container mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Para Quem é o Conversy?
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Ideal para quem quer vender produtos digitais de forma automatizada e profissional.
          </p>
        </ScrollReveal>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {audiences.map((audience) => (
            <motion.div key={audience.title} variants={staggerItem}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${audience.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="landing-feature-card relative rounded-3xl h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.iconGradient} flex items-center justify-center mb-6 shadow-lg ${audience.iconShadow}`}>
                    <audience.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl mb-3 font-display font-semibold">{audience.title}</h3>
                  <p className="font-body text-muted-foreground mb-5 leading-relaxed">
                    {audience.description}
                  </p>
                  <ul className="space-y-3">
                    {audience.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-body text-muted-foreground">
                        <CheckCircle2 className={`w-4 h-4 ${audience.checkColor} shrink-0`} strokeWidth={1.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
