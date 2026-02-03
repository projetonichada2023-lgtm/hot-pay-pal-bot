import { motion } from "framer-motion";
import { ScrollReveal } from "./shared/ScrollReveal";
import { staggerContainer, staggerItem } from "./shared/animations";
import { steps } from "./shared/data";

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 px-4 bg-[#0a0a0a]">
      <div className="container mx-auto">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Como Funciona
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Em apenas 3 passos simples, seu negócio estará pronto para receber vendas.
          </p>
        </ScrollReveal>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={step.number}
              variants={staggerItem}
              className="relative"
            >
              <motion.div 
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Step Card with Premium Glassmorphism */}
                <div className="landing-feature-card !p-10 rounded-3xl text-center h-full relative overflow-hidden">
                  <motion.div 
                    className="text-8xl font-display font-bold text-primary/10 absolute top-6 right-6"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 150, 
                      damping: 15,
                      delay: index * 0.15 
                    }}
                  >
                    {step.number}
                  </motion.div>
                  <div className="w-[72px] h-[72px] rounded-2xl bg-primary/10 flex items-center justify-center mb-8 mx-auto">
                    <step.icon className="w-9 h-9 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl mb-4 font-display font-semibold">{step.title}</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Connection line for desktop */}
        <div className="hidden md:block max-w-4xl mx-auto mt-10">
          <motion.div 
            className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </section>
  );
}
