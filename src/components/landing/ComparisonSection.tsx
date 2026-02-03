import { motion } from "framer-motion";
import { CheckCircle2, X, Minus, Send, MessageCircle, ShoppingCart } from "lucide-react";
import { ScrollReveal } from "./shared/ScrollReveal";
import { benefits } from "./shared/data";

function StatusIcon({ status }: { status: boolean | string }) {
  if (status === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-primary" />
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
        <Minus className="w-4 h-4 text-yellow-500" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
      <X className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

export function ComparisonSection() {
  return (
    <section id="beneficios" className="py-24 px-4 relative bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.015] to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Por que escolher o Conversy?
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Compare e veja as vantagens de vender no Telegram com automação.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl landing-feature-card !p-0">
            {/* Table Header */}
            <div className="grid grid-cols-4">
              <div className="p-5 md:p-6 font-display font-semibold text-sm md:text-base border-b border-white/5">Recurso</div>
              <div className="p-5 md:p-6 text-center border-b border-primary/20 conversy-column-glow relative">
                <div className="inline-flex flex-col items-center gap-2 relative z-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/40">
                    <Send className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="font-display font-bold text-sm md:text-base text-primary">Conversy</span>
                </div>
              </div>
              <div className="p-5 md:p-6 text-center border-b border-white/5">
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-600/80 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="font-body text-sm md:text-base text-muted-foreground">WhatsApp</span>
                </div>
              </div>
              <div className="p-5 md:p-6 text-center border-b border-white/5">
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="font-body text-sm md:text-base text-muted-foreground">Outros</span>
                </div>
              </div>
            </div>

            {/* Table Rows */}
            {benefits.map((row, index) => (
              <motion.div
                key={row.feature}
                className="grid grid-cols-4 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="p-4 md:p-5 text-sm md:text-base font-body text-muted-foreground">{row.feature}</div>
                <div className="p-4 md:p-5 flex justify-center items-center conversy-column-glow relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 500, delay: index * 0.05 + 0.1 }}
                    className="relative z-10"
                  >
                    <StatusIcon status={row.conversy} />
                  </motion.div>
                </div>
                <div className="p-4 md:p-5 flex justify-center items-center">
                  <StatusIcon status={row.whatsapp} />
                </div>
                <div className="p-4 md:p-5 flex justify-center items-center">
                  <StatusIcon status={row.others} />
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
