import { motion } from "framer-motion";
import { ScrollReveal } from "./shared/ScrollReveal";
import { staggerContainer, staggerItem } from "./shared/animations";
import { Zap, Users, MessageSquare, Layers, CheckCircle2 } from "lucide-react";

const items = [
  { 
    title: "Entrega Zero Delay", 
    desc: "O seu cliente recebe o acesso em milissegundos após o pagamento ser confirmado via PIX.", 
    icon: Zap,
    details: ["Confirmação Real-time", "Links Seguros", "Ficheiros até 2GB"]
  },
  { 
    title: "Gestão de Membros", 
    desc: "Automação total: adicione novos membros e remova inadimplentes sem tocar num botão.", 
    icon: Users,
    details: ["Grupos Privados", "Canais de Conteúdo", "Controlo de Expiração"]
  },
  { 
    title: "Recuperação Inteligente", 
    desc: "Recupere até 35% das vendas perdidas com mensagens automáticas no chat do cliente.", 
    icon: MessageSquare,
    details: ["Lembrete de PIX", "Ofertas de Escassez", "Apoio Automático"]
  },
  { 
    title: "Funil de Upsell", 
    desc: "Aumente o seu ticket médio oferecendo produtos extras imediatamente após a compra.", 
    icon: Layers,
    details: ["One-Click Buy", "Sugestões Dinâmicas", "Métricas de Bump"]
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 relative bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,92,0,0.04),transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            O motor do seu{" "}
            <span className="text-primary" style={{ textShadow: "0 0 30px rgba(255, 92, 0, 0.3)" }}>
              Império Digital.
            </span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Desenvolvemos as ferramentas necessárias para que a tecnologia não seja uma barreira para o seu lucro.
          </p>
        </ScrollReveal>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-xl mb-3 font-display font-semibold">{item.title}</h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">{item.desc}</p>
                  
                  <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                    {item.details.map((detail) => (
                      <div key={detail} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
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
