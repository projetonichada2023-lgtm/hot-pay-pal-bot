import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { ScrollReveal } from "./shared/ScrollReveal";
import { staggerContainer, staggerItem } from "./shared/animations";

const reviews = [
  {
    name: "Lucas Mendes",
    role: "Infoprodutor (6 dígitos)",
    comment: "A Conversy revolucionou as minhas vendas. Antes perdia horas a responder, agora tudo é automático. Faturamento triplicou!",
    avatar: "https://i.pravatar.cc/100?u=lucas"
  },
  {
    name: "Ana Carolina",
    role: "Estrategista Digital",
    comment: "A recuperação de carrinho é surreal! Recupero em média 30% das vendas que seriam perdidas no checkout. Essencial.",
    avatar: "https://i.pravatar.cc/100?u=ana"
  },
  {
    name: "Pedro Silva",
    role: "Dono de Comunidade VIP",
    comment: "Gerir acessos manualmente era um pesadelo. Com a Conversy o bot faz tudo: pagamento, entrada e remoção. Nota 10.",
    avatar: "https://i.pravatar.cc/100?u=pedro"
  }
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="py-24 px-4 relative bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,92,0,0.03),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Resultados{" "}
            <span className="text-primary" style={{ textShadow: "0 0 30px hsl(24 100% 55% / 0.3)" }}>
              Reais.
            </span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Veja como empreendedores estão a faturar mais com menos esforço usando a Conversy.
          </p>
        </ScrollReveal>

        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {reviews.map((rev) => (
            <motion.div
              key={rev.name}
              variants={staggerItem}
            >
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="landing-feature-card h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-display font-semibold text-sm">{rev.name}</p>
                      <p className="text-xs text-muted-foreground">{rev.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
