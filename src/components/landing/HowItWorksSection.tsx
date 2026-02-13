import { motion } from "framer-motion";
import { Bot, Layers, Rocket, Play } from "lucide-react";
import { ScrollReveal } from "./shared/ScrollReveal";
import { staggerContainer, staggerItem } from "./shared/animations";

const steps = [
  {
    step: "01",
    title: "Conecte o seu Bot",
    desc: "Crie um bot no Telegram e conecte à Conversy em segundos. Sem código, sem stress.",
    icon: Bot,
  },
  {
    step: "02",
    title: "Configure os Produtos",
    desc: "Suba os seus ficheiros ou links e defina o valor do checkout. PIX já vem integrado.",
    icon: Layers,
  },
  {
    step: "03",
    title: "Venda no Automático",
    desc: "O bot atende, vende e entrega 24 horas por dia, 7 dias por semana para si.",
    icon: Rocket,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 relative bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,92,0,0.03),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Steps */}
          <div>
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl mb-10 font-display font-bold tracking-tight">
                Em apenas{" "}
                <span className="text-primary" style={{ textShadow: "0 0 30px rgba(255, 92, 0, 0.3)" }}>
                  3 passos
                </span>{" "}
                simples.
              </h2>
            </ScrollReveal>

            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {steps.map((item) => (
                <motion.div
                  key={item.step}
                  variants={staggerItem}
                  className="flex items-start gap-5"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs font-display font-medium text-primary mb-1">{item.step}</div>
                    <h3 className="text-lg font-display font-semibold mb-1">{item.title}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
            <div className="relative landing-feature-card !p-10 rounded-3xl text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-primary" />
              </div>
              <p className="font-display font-medium text-sm text-muted-foreground">Ver Vídeo Demonstrativo</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
