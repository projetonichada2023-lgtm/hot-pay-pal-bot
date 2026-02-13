import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Rocket } from "lucide-react";
import { ScrollReveal } from "./shared/ScrollReveal";
import { scaleIn } from "./shared/animations";

export function CTASection() {
  return (
    <section className="py-24 px-4 bg-black">
      <div className="container mx-auto">
        <ScrollReveal variants={scaleIn}>
          <div className="landing-feature-card !p-10 md:!p-16 text-center relative overflow-hidden rounded-[2rem]">
            {/* Animated glow */}
            <motion.div 
              className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-[100px]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-64 h-64 bg-primary/15 rounded-full blur-[100px]"
              animate={{ scale: [1.3, 1, 1.3], opacity: [0.7, 0.4, 0.7] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Rocket className="w-8 h-8 text-primary" />
              </motion.div>
              
              <h2 className="text-3xl md:text-5xl mb-5 font-display font-bold tracking-tight">
                O Futuro é{" "}
                <span className="text-primary" style={{ textShadow: "0 0 30px rgba(255, 92, 0, 0.4)" }}>
                  Conversacional.
                </span>
              </h2>
              <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Não fique para trás. A era do 1-a-1 manual acabou. Automatize agora e comece a escalar hoje mesmo.
              </p>
              
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="gap-2 text-base px-10 h-14 font-display font-medium btn-gradient rounded-2xl">
                    Criar Minha Conta Gratuita
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
