import { motion } from "framer-motion";
import { ScrollReveal } from "./shared/ScrollReveal";
import { staggerContainer, staggerItem } from "./shared/animations";
import { features } from "./shared/data";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 relative bg-[#0a0a0a]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.015] to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Tudo que você precisa para vender
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Ferramentas poderosas para criar, gerenciar e escalar seu negócio digital no Telegram.
          </p>
        </ScrollReveal>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
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
                    <feature.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-xl mb-3 font-display font-semibold">{feature.title}</h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
