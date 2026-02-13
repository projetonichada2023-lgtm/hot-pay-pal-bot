import { motion } from "framer-motion";
import { ScrollReveal } from "./shared/ScrollReveal";
import { staggerContainer, staggerItem } from "./shared/animations";
import { Zap, Users, MessageSquare, Layers, ArrowRight } from "lucide-react";
import { SectionTag } from "./SectionTag";

const items = [
  { 
    title: "Entrega Instantânea", 
    desc: "O seu cliente recebe o acesso em milissegundos após o pagamento ser confirmado via PIX.", 
    icon: Zap,
  },
  { 
    title: "Gestão de Membros", 
    desc: "Automação total: adicione novos membros e remova inadimplentes sem tocar num botão.", 
    icon: Users,
  },
  { 
    title: "Recuperação Inteligente", 
    desc: "Recupere até 35% das vendas perdidas com mensagens automáticas no chat do cliente.", 
    icon: MessageSquare,
  },
  { 
    title: "Funil de Upsell", 
    desc: "Aumente o seu ticket médio oferecendo produtos extras imediatamente após a compra.", 
    icon: Layers,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 px-4 relative">
      <div className="container mx-auto relative z-10">
        <ScrollReveal className="text-center mb-10 md:mb-16">
          <SectionTag>Funcionalidades de Elite</SectionTag>
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            O motor por trás dos{" "}
            <span className="text-primary" style={{ textShadow: "0 0 30px hsl(24 100% 55% / 0.3)" }}>
              Grandes Players.
            </span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Tudo o que precisa para gerir milhares de clientes sem precisar de uma equipa de suporte.
          </p>
        </ScrollReveal>
        
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={staggerItem}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="landing-feature-card h-full group">
                  <motion.div 
                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-5 group-hover:bg-primary/20 transition-colors duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className="w-5 h-5 md:w-7 md:h-7 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-sm md:text-xl mb-1 md:mb-3 font-display font-semibold">{item.title}</h3>
                  <p className="font-body text-muted-foreground text-xs md:text-sm leading-relaxed mb-2 md:mb-4">{item.desc}</p>
                  
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary font-display font-medium cursor-pointer hover:gap-2.5 transition-all">
                    Saber Mais <ArrowRight className="w-3.5 h-3.5" />
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
