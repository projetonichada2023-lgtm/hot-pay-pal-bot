import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "./shared/ScrollReveal";
import { scaleIn, staggerContainer, staggerItem } from "./shared/animations";

const ctaFeatures = [
  { icon: CheckCircle2, text: "Sem cartão de crédito" },
  { icon: CheckCircle2, text: "Setup em 5 minutos" },
  { icon: CheckCircle2, text: "Suporte incluso" }
];

export function CTASection() {
  return (
    <section className="py-24 px-4 bg-[#0a0a0a]">
      <div className="container mx-auto">
        <ScrollReveal variants={scaleIn}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="landing-feature-card !p-10 md:!p-16 text-center relative overflow-hidden rounded-[2rem]">
              {/* Animated background elements */}
              <motion.div 
                className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-[100px]"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-64 h-64 bg-primary/15 rounded-full blur-[100px]"
                animate={{ 
                  scale: [1.3, 1, 1.3],
                  opacity: [0.7, 0.4, 0.7]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-3xl md:text-5xl mb-5 font-display font-bold tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  Pronto para começar?
                </motion.h2>
                <motion.p 
                  className="font-body text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  Crie seu negócio gratuito agora e comece a vender em minutos. Sem taxas mensais, pague apenas por venda.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link to="/auth">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" className="gap-2 text-base px-10 h-14 font-display font-medium btn-gradient rounded-2xl">
                        Criar Conta Grátis
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
                
                <motion.div 
                  className="flex flex-wrap justify-center gap-8 text-sm font-body text-muted-foreground"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {ctaFeatures.map((item, index) => (
                    <motion.div 
                      key={item.text}
                      className="flex items-center gap-2"
                      variants={staggerItem}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 200, 
                          delay: 0.3 + index * 0.1 
                        }}
                      >
                        <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </motion.div>
                      {item.text}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
