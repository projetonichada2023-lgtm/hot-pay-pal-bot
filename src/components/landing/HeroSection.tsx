import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, TrendingUp, Play, CheckCircle2 } from "lucide-react";
import conversyIcon from "@/assets/conversy-icon-new.png";
import { SectionTag } from "./SectionTag";

interface HeroSectionProps {
  onOpenDemo: () => void;
}

export function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <section ref={heroRef} className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 relative overflow-hidden min-h-[80vh] md:min-h-screen flex items-center">
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionTag>Automação Inteligente 2026</SectionTag>
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-5xl lg:text-7xl leading-[1.05] mb-4 md:mb-6 font-display font-bold tracking-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-gradient-white">Automatize.</span>{" "}
              <motion.span 
                className="text-primary"
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ textShadow: "0 0 30px rgba(255, 92, 0, 0.4)" }}
              >
                Escale. Lucre.
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-xl max-w-lg mb-6 md:mb-8 font-body text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 40 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              Transforme o seu Telegram numa máquina de vendas com checkout PIX, entrega automática e gestão inteligente de membros.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 40 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.65 }}
            >
              <Link to="/auth" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="gap-2 text-base px-8 w-full sm:w-auto h-14 sm:h-12 text-lg sm:text-base font-display font-medium btn-gradient rounded-2xl uppercase tracking-wide">
                    Abrir Minha Loja
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
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
                  <Play className="w-4 h-4" />
                  Ver Demonstração
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="flex items-center gap-6 md:gap-8 mt-8 md:mt-12"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div>
                <div className="text-2xl md:text-3xl font-display font-bold text-primary" style={{ textShadow: "0 0 20px rgba(255, 92, 0, 0.3)" }}>R$ 20M+</div>
                <div className="text-xs text-muted-foreground mt-1">em Vendas Processadas</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl md:text-3xl font-display font-bold text-primary" style={{ textShadow: "0 0 20px rgba(255, 92, 0, 0.3)" }}>5.000+</div>
                <div className="text-xs text-muted-foreground mt-1">Empreendedores Ativos</div>
              </div>
            </motion.div>
          </div>

          {/* Right: Dashboard Mockup */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 60, rotateY: -15 }}
            animate={heroInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: "1200px" }}
          >
            {/* Glow behind card */}
            <div className="absolute -inset-8 bg-primary/10 rounded-3xl blur-3xl" />
            
            <div className="relative glass rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <img src={conversyIcon} alt="Conversy" className="h-5 w-auto" />
                  <span className="text-[10px] text-muted-foreground font-mono">Dashboard Admin</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] text-green-400 font-mono">Ativo • Tempo Real</span>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Vendas Hoje</p>
                  <p className="text-xl font-display font-bold text-primary">R$ 4.2K</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Conv. Média</p>
                  <p className="text-xl font-display font-bold text-foreground">28%</p>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <p className="text-xs font-medium text-foreground mb-3">Atividade Recente</p>
                <div className="space-y-3">
                  {[
                    { label: "Novo Pagamento Confirmado", val: "+ R$ 197,00", color: "text-primary" },
                    { label: "Acesso Enviado ao Cliente", val: "Sucesso", color: "text-green-400" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={heroInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 1.2 + i * 0.15 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[11px] text-muted-foreground">{item.label}</span>
                      </div>
                      <span className={`text-[11px] font-semibold ${item.color}`}>{item.val}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <motion.div
              className="absolute -bottom-4 -left-8 glass rounded-xl p-3 flex items-center gap-2 shadow-2xl"
              style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.5 }}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-foreground">+23% esta semana</p>
                <p className="text-[9px] text-muted-foreground">Vendas em alta</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
