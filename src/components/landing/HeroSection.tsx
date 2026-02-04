import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Zap } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { DashboardMockup } from "./DashboardMockup";
import { scaleIn, staggerContainer } from "./shared/animations";
import unipayLogo from "@/assets/unipay-logo.png";

interface HeroSectionProps {
  onOpenDemo: () => void;
}

export function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <section ref={heroRef} className="pt-32 pb-20 px-4 relative overflow-hidden min-h-screen">
      {/* Dark Background with Aurora Effects */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
        {/* Premium overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 via-transparent to-[#0a0a0a]/40" />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent,#0a0a0a_90%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
        />
        
        {/* Aurora/Glow Effects */}
        <motion.div
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)' }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -25, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[20%] w-[350px] h-[350px] rounded-full opacity-10 blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.15, 0.08],
            x: [0, 20, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-[40%] right-[25%] w-[300px] h-[300px] rounded-full opacity-10 blur-[90px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)' }}
          animate={{
            scale: [1.05, 0.95, 1.05],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6"
        >
          <Zap className="w-4 h-4" />
          <span>Automatize suas vendas no Telegram</span>
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight mb-6 font-display font-bold tracking-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Venda Produtos Digitais
          <motion.span 
            className="text-primary block mt-2"
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Direto no Telegram
          </motion.span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl max-w-2xl mx-auto mb-8 font-body text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Crie seu bot de vendas automatizado com pagamento PIX, entrega instantânea e recuperação de carrinho. Sem código, sem complicação.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
          initial={{ opacity: 0, y: 40 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to="/auth" className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="gap-2 text-base px-8 w-full sm:w-auto h-14 sm:h-12 text-lg sm:text-base font-display font-medium btn-gradient rounded-2xl">
                Começar Agora
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </motion.div>
              </Button>
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 text-base px-8 w-full sm:w-auto h-14 sm:h-12 text-lg sm:text-base font-display font-medium rounded-2xl border-white/10 hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-300"
              onClick={onOpenDemo}
            >
              <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
              Ver Demonstração
            </Button>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup with 3D effect */}
        <DashboardMockup />

        {/* Stats with animated counters */}
        <motion.div 
          className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-16"
          variants={staggerContainer}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
        >
          <motion.div className="text-center" variants={scaleIn}>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              <AnimatedCounter value={500} suffix="+" delay={0.8} duration={1.5} />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Negócios Ativos</div>
          </motion.div>
          
          <motion.div className="text-center" variants={scaleIn}>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              <AnimatedCounter value={2} prefix="R$" suffix="M+" delay={0.9} duration={1.5} />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Vendas Processadas</div>
          </motion.div>
          
          <motion.div className="text-center" variants={scaleIn}>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              <AnimatedCounter value={98} suffix="%" delay={1} duration={1.5} />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Satisfação</div>
          </motion.div>
        </motion.div>

        {/* Partnership Badge */}
        <motion.div 
          className="mt-12 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p className="text-sm text-muted-foreground">Pagamentos processados com segurança por</p>
          <motion.a
            href="https://unipaybr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <img 
              src={unipayLogo} 
              alt="UniPay - Gateway de Pagamentos" 
              className="h-8 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
            <div className="h-6 w-px bg-border/50" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Parceiro Oficial</p>
              <p className="text-sm font-medium text-emerald-400">Gateway de Pagamentos</p>
            </div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
