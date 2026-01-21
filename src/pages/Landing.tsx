import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Bot, 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp, 
  Zap, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Send,
  X,
  Minus,
  Lock,
  Headphones,
  BadgeCheck,
  Activity,
  Instagram,
  Youtube,
  BookOpen,
  Mail,
  ExternalLink,
  Menu,
  Clock,
  CreditCard,
  Truck,
  BarChart3,
  Users,
  Gift
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { motion, useInView, Variants } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import conversyLogo from "@/assets/conversy-logo.png";
import unipayLogo from "@/assets/unipay-logo.png";

// Lazy load heavy components
const DemoModal = lazy(() => import("@/components/landing/DemoModal").then(m => ({ default: m.DemoModal })));
const Accordion = lazy(() => import("@/components/ui/accordion").then(m => ({ default: m.Accordion })));
const AccordionContent = lazy(() => import("@/components/ui/accordion").then(m => ({ default: m.AccordionContent })));
const AccordionItem = lazy(() => import("@/components/ui/accordion").then(m => ({ default: m.AccordionItem })));
const AccordionTrigger = lazy(() => import("@/components/ui/accordion").then(m => ({ default: m.AccordionTrigger })));
const TestimonialsSection = lazy(() => import("@/components/ui/testimonials-with-marquee").then(m => ({ default: m.TestimonialsSection })));

// Loading fallback for lazy components
const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const features = [
  {
    icon: Bot,
    title: "Bot Automatizado",
    description: "Atendimento 24/7 com respostas instantâneas e fluxos personalizados."
  },
  {
    icon: ShoppingCart,
    title: "Vendas no Telegram",
    description: "Catálogo de produtos integrado com pagamento PIX automático."
  },
  {
    icon: MessageCircle,
    title: "Recuperação de Carrinho",
    description: "Mensagens automáticas para recuperar vendas abandonadas."
  },
  {
    icon: TrendingUp,
    title: "Funil de Upsell",
    description: "Aumente o ticket médio com ofertas inteligentes pós-compra."
  },
  {
    icon: Zap,
    title: "Entrega Automática",
    description: "Produtos digitais entregues instantaneamente após pagamento."
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Pagamentos processados com segurança e criptografia."
  }
];

const steps = [
  {
    number: "01",
    icon: Bot,
    title: "Configure seu Bot",
    description: "Conecte seu bot do Telegram em poucos cliques e personalize todas as mensagens de atendimento."
  },
  {
    number: "02",
    icon: ShoppingCart,
    title: "Cadastre Produtos",
    description: "Adicione seus produtos digitais com preços, descrições e configure entrega automática."
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Receba Vendas",
    description: "Seus clientes compram direto no Telegram com PIX. Entrega e confirmação automáticas."
  }
];

const benefits = [
  { 
    feature: "Automação 100% sem código", 
    conversy: true, 
    whatsapp: false, 
    others: "partial" 
  },
  { 
    feature: "Bot próprio personalizado", 
    conversy: true, 
    whatsapp: false, 
    others: false 
  },
  { 
    feature: "PIX automático integrado", 
    conversy: true, 
    whatsapp: false, 
    others: true 
  },
  { 
    feature: "Entrega instantânea", 
    conversy: true, 
    whatsapp: false, 
    others: true 
  },
  { 
    feature: "Recuperação de carrinho", 
    conversy: true, 
    whatsapp: "partial", 
    others: true 
  },
  { 
    feature: "Funil de upsell automático", 
    conversy: true, 
    whatsapp: false, 
    others: "partial" 
  },
  { 
    feature: "Sem mensalidade fixa", 
    conversy: true, 
    whatsapp: true, 
    others: false 
  },
  { 
    feature: "Taxa por transação baixa", 
    conversy: true, 
    whatsapp: true, 
    others: false 
  },
  { 
    feature: "Chat direto com cliente", 
    conversy: true, 
    whatsapp: true, 
    others: false 
  },
  { 
    feature: "Acesso a grupos automático", 
    conversy: true, 
    whatsapp: false, 
    others: false 
  },
];

const testimonials = [
  {
    author: {
      name: "Lucas Mendes",
      handle: "@lucasmendes",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=75"
    },
    text: "O Conversy revolucionou minhas vendas. Antes eu perdia horas respondendo mensagens, agora tudo é automático. Meu faturamento triplicou em 2 meses!"
  },
  {
    author: {
      name: "Ana Carolina",
      handle: "@anacarolina",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=75"
    },
    text: "A recuperação de carrinho é incrível! Recupero em média 30% das vendas abandonadas. O investimento se paga no primeiro dia."
  },
  {
    author: {
      name: "Pedro Silva",
      handle: "@pedrosilva",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=75"
    },
    text: "Simplicidade é a palavra. Configurei minha loja em menos de 10 minutos e já comecei a vender. O suporte é excepcional!"
  },
  {
    author: {
      name: "Mariana Costa",
      handle: "@maricosta",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format&q=75"
    },
    text: "O funil de upsell aumentou meu ticket médio em 45%. Meus clientes compram mais sem eu precisar fazer nada."
  },
  {
    author: {
      name: "Rafael Santos",
      handle: "@rafaelsantos",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=75"
    },
    text: "Migrei do WhatsApp para o Telegram com o Conversy e minhas vendas aumentaram 80%. A automação é outro nível!"
  },
  {
    author: {
      name: "Julia Fernandes",
      handle: "@juliafernandes",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=75"
    },
    text: "Finalmente uma plataforma que entende o produtor digital. Entrega automática, PIX instantâneo, tudo perfeito!"
  }
];

const faqs = [
  {
    question: "Como funciona o pagamento PIX?",
    answer: "Quando um cliente faz uma compra, geramos automaticamente um código PIX. Após o pagamento ser confirmado, o produto é entregue instantaneamente no chat do Telegram. Todo o processo é 100% automático."
  },
  {
    question: "Preciso ter conhecimento técnico?",
    answer: "Não! O Conversy foi criado para ser simples. Você só precisa criar um bot no Telegram (com um clique), cadastrar seus produtos e pronto. Não precisa programar nada."
  },
  {
    question: "Quais tipos de produtos posso vender?",
    answer: "Você pode vender qualquer produto digital: e-books, cursos, mentorias, acessos a grupos VIP, templates, presets, softwares, e muito mais. Se é digital, você pode vender!"
  },
  {
    question: "Como funciona a recuperação de carrinho?",
    answer: "Quando um cliente inicia uma compra mas não finaliza, nosso sistema envia mensagens automáticas lembrando do pagamento pendente. Você pode personalizar as mensagens e os intervalos de envio."
  },
  {
    question: "Qual a taxa por venda?",
    answer: "Cobramos apenas uma pequena taxa por transação aprovada. Não há mensalidades ou custos fixos. Você só paga quando vende!"
  },
  {
    question: "Posso integrar com outras ferramentas?",
    answer: "Sim! Oferecemos webhooks e API para integração com outras plataformas. Você pode conectar com seu CRM, automações de e-mail, planilhas e muito mais."
  },
  {
    question: "O suporte está incluso?",
    answer: "Sim! Todos os planos incluem suporte via chat. Estamos disponíveis para ajudar você a configurar sua loja e resolver qualquer dúvida."
  }
];

// Animation variants - Premium stagger animations
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Scroll reveal component with improved intersection
function ScrollReveal({ 
  children, 
  variants = fadeInUp,
  className = "",
}: { 
  children: React.ReactNode; 
  variants?: Variants;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Render status icon
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

export default function Landing() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const [demoOpen, setDemoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Force dark mode on landing page
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/30"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
          >
            <img 
              src={conversyLogo} 
              alt="Conversy" 
              className="h-8 w-auto object-contain"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Benefícios
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="gap-2 cta-button rounded-lg">
                  Começar Grátis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background border-border">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <img 
                      src={conversyLogo} 
                      alt="Conversy" 
                      className="h-8 w-auto object-contain"
                    />
                  </div>

                  <nav className="flex flex-col gap-4">
                    <a 
                      href="#features" 
                      className="text-lg hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Recursos
                    </a>
                    <a 
                      href="#como-funciona" 
                      className="text-lg hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Como Funciona
                    </a>
                    <a 
                      href="#beneficios" 
                      className="text-lg hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Benefícios
                    </a>
                    <a 
                      href="#faq" 
                      className="text-lg hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      FAQ
                    </a>
                  </nav>

                  <div className="border-t border-border pt-6 mt-2 flex flex-col gap-3">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center rounded-lg">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-center gap-2 cta-button rounded-lg">
                        Começar Grátis
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Demo Button */}
                  <Button 
                    variant="secondary" 
                    className="w-full gap-2 mt-2 rounded-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setDemoOpen(true);
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ver Demonstração
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        {/* Animated background blobs - hidden on mobile for performance */}
        <motion.div 
          className="hidden md:block absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl will-change-transform"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="hidden md:block absolute top-40 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl will-change-transform"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
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
            className="text-4xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight mb-6 premium-heading"
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
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8 premium-body"
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="gap-2 text-base px-8 w-full sm:w-auto h-14 sm:h-12 text-lg sm:text-base cta-button cta-shine rounded-xl">
                  Criar Minha Loja
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 text-base px-8 w-full sm:w-auto h-14 sm:h-12 text-lg sm:text-base rounded-xl border-border/50"
                onClick={() => setDemoOpen(true)}
              >
                <MessageCircle className="w-5 h-5" />
                Ver Demonstração
              </Button>
            </motion.div>
          </motion.div>

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

      {/* Features Section - Glassmorphism Cards */}
      <section id="features" className="py-24 px-4 relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        
        <div className="container mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 premium-heading">
              Tudo que você precisa para vender
            </h2>
            <p className="premium-body text-lg max-w-2xl mx-auto">
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
                  <div className="glass-premium p-8 rounded-2xl h-full group transition-all duration-500">
                    <motion.div 
                      className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="w-7 h-7 text-primary" />
                    </motion.div>
                    <h3 className="text-xl mb-3 premium-heading">{feature.title}</h3>
                    <p className="premium-body text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works - Enhanced Premium */}
      <section id="como-funciona" className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl mb-4 premium-heading">
              Como Funciona
            </h2>
            <p className="premium-body text-lg max-w-2xl mx-auto">
              Em apenas 3 passos simples, sua loja estará pronta para receber vendas.
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
                  {/* Step Card with Glassmorphism */}
                  <div className="glass-premium p-10 rounded-3xl text-center h-full">
                    <motion.div 
                      className="text-8xl font-bold text-primary/10 absolute top-6 right-6 premium-heading"
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
                    <div className="w-18 h-18 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 mx-auto w-[72px] h-[72px]">
                      <step.icon className="w-9 h-9 text-primary" />
                    </div>
                    <h3 className="text-2xl mb-4 premium-heading">{step.title}</h3>
                    <p className="premium-body">{step.description}</p>
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

      {/* Benefits Comparison Table - Premium with Conversy Glow */}
      <section id="beneficios" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        
        <div className="container mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 premium-heading">
              Por que escolher o Conversy?
            </h2>
            <p className="premium-body text-lg max-w-2xl mx-auto">
              Compare e veja as vantagens de vender no Telegram com automação.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl glass-premium">
              {/* Table Header */}
              <div className="grid grid-cols-4">
                <div className="p-5 md:p-6 font-medium text-sm md:text-base border-b border-white/5 premium-heading">Recurso</div>
                <div className="p-5 md:p-6 text-center border-b border-white/5 conversy-glow bg-primary/[0.08]">
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Send className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-sm md:text-base text-primary premium-heading">Conversy</span>
                  </div>
                </div>
                <div className="p-5 md:p-6 text-center border-b border-white/5">
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <span className="font-medium text-sm md:text-base text-muted-foreground">WhatsApp</span>
                  </div>
                </div>
                <div className="p-5 md:p-6 text-center border-b border-white/5">
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm md:text-base text-muted-foreground">Hotmart/Kiwify</span>
                  </div>
                </div>
              </div>

              {/* Table Rows */}
              {benefits.map((row, index) => (
                <motion.div
                  key={row.feature}
                  className="grid grid-cols-4 border-b border-white/5 last:border-b-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="p-4 md:p-5 text-sm md:text-base premium-body">{row.feature}</div>
                  <div className="p-4 md:p-5 flex justify-center items-center conversy-glow bg-primary/[0.04]">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 500, delay: index * 0.05 + 0.1 }}
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

      {/* Para Quem é Section - Premium */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 premium-heading">
              Para Quem é o Conversy?
            </h2>
            <p className="premium-body text-lg max-w-2xl mx-auto">
              Ideal para quem quer vender produtos digitais de forma automatizada e profissional.
            </p>
          </ScrollReveal>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {/* Infoprodutores */}
            <motion.div variants={staggerItem}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="glass-premium relative p-8 rounded-3xl h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-3 premium-heading">Infoprodutores</h3>
                  <p className="premium-body mb-5">
                    Venda cursos, e-books, mentorias e templates direto no Telegram com entrega automática.
                  </p>
                  <ul className="space-y-3">
                    {["Entrega instantânea de arquivos", "Upsell pós-compra automático", "Métricas de conversão"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>

            {/* Criadores de Conteúdo */}
            <motion.div variants={staggerItem}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="glass-premium relative p-8 rounded-3xl h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-3 premium-heading">Criadores de Conteúdo</h3>
                  <p className="premium-body mb-5">
                    Monetize sua audiência vendendo conteúdo exclusivo direto onde ela já está.
                  </p>
                  <ul className="space-y-3">
                    {["Presets e packs exclusivos", "Aulas e tutoriais premium", "Atendimento automatizado"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>

            {/* Comunidades VIP */}
            <motion.div variants={staggerItem}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="glass-premium relative p-8 rounded-3xl h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-3 premium-heading">Comunidades VIP</h3>
                  <p className="premium-body mb-5">
                    Gerencie acessos a grupos exclusivos com cobrança recorrente ou única.
                  </p>
                  <ul className="space-y-3">
                    {["Acesso automático ao grupo", "Gestão de membros integrada", "Renovação e cancelamento"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section - Premium */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        
        <div className="container mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 premium-heading">
              Segurança em Primeiro Lugar
            </h2>
            <p className="premium-body text-lg max-w-2xl mx-auto">
              Seus pagamentos e dados estão protegidos com a mais alta tecnologia.
            </p>
          </ScrollReveal>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
              { icon: Lock, title: "Dados Criptografados", desc: "SSL 256-bit em todas as transações", color: "emerald" },
              { icon: Shield, title: "LGPD Compliant", desc: "Conformidade total com a lei brasileira", color: "blue" },
              { icon: Headphones, title: "Suporte 24/7", desc: "Atendimento prioritário via Telegram", color: "violet" },
              { icon: Activity, title: "+5.000/dia", desc: "Transações processadas diariamente", color: "amber" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                className="glass-premium flex items-center gap-4 p-6 rounded-2xl"
              >
                <div className={`w-14 h-14 rounded-xl bg-${item.color}-500/20 flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-7 h-7 text-${item.color}-500`} />
                </div>
                <div>
                  <p className="font-bold premium-heading">{item.title}</p>
                  <p className="text-sm premium-body">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional trust indicators */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-6 mt-12 pt-10 border-t border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 text-sm premium-body">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <span>Empresa 100% Brasileira</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-sm premium-body">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <span>Sem mensalidade fixa</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-sm premium-body">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <span>Entrega instantânea garantida</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-sm premium-body">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <span>PIX em tempo real</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <TestimonialsSection
          title="O que nossos clientes dizem"
          description="Milhares de empreendedores já transformaram suas vendas com o Conversy."
          testimonials={testimonials}
        />
      </Suspense>

      {/* FAQ Section - Premium */}
      <section id="faq" className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 premium-heading">
              Perguntas Frequentes
            </h2>
            <p className="premium-body text-lg max-w-2xl mx-auto">
              Tire suas dúvidas sobre o Conversy.
            </p>
          </ScrollReveal>
          
          <ScrollReveal className="max-w-3xl mx-auto">
            <Suspense fallback={<SectionLoader />}>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="glass-premium border-0 rounded-2xl overflow-hidden data-[state=open]:ring-1 data-[state=open]:ring-primary/20"
                  >
                    <AccordionTrigger className="text-left hover:no-underline hover:text-primary transition-colors py-6 text-base px-6 premium-heading font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="premium-body leading-relaxed pb-6 px-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Suspense>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal variants={scaleIn}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="glass-premium p-10 md:p-16 text-center relative overflow-hidden rounded-[2rem]">
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
                    className="text-3xl md:text-5xl mb-5 premium-heading"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Pronto para começar?
                  </motion.h2>
                  <motion.p 
                    className="premium-body text-lg max-w-xl mx-auto mb-10"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Crie sua loja gratuita agora e comece a vender em minutos. Sem taxas mensais, pague apenas por venda.
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
                        <Button size="lg" className="gap-2 text-base px-10 h-14 cta-button cta-shine rounded-xl">
                          Criar Conta Grátis
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-wrap justify-center gap-8 text-sm premium-body"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {[
                      { icon: CheckCircle2, text: "Sem cartão de crédito" },
                      { icon: CheckCircle2, text: "Setup em 5 minutos" },
                      { icon: CheckCircle2, text: "Suporte incluso" }
                    ].map((item, index) => (
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
                          <item.icon className="w-5 h-5 text-primary" />
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

      {/* Footer */}
      <motion.footer 
        className="py-12 px-4 border-t border-border/30 bg-card/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <motion.div 
                className="flex items-center mb-4"
                whileHover={{ scale: 1.02 }}
              >
                <img 
                  src={conversyLogo} 
                  alt="Conversy" 
                  className="h-8 w-auto object-contain"
                />
              </motion.div>
              <p className="text-sm text-muted-foreground mb-4">
                Automatize suas vendas no Telegram com pagamento PIX, entrega instantânea e recuperação de carrinho.
              </p>
              {/* Social Media */}
              <div className="flex items-center gap-3">
                <motion.a
                  href="https://instagram.com/conversy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/30 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="https://youtube.com/@conversy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/30 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Youtube className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="https://t.me/conversy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/30 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.a>
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h4 className="font-medium mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/auth" className="hover:text-primary transition-colors">
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:text-primary transition-colors">
                    Entrar
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                    Recursos
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-medium mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="https://t.me/conversy_suporte" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    Suporte Telegram
                  </a>
                </li>
                <li>
                  <a href="mailto:suporte@conversy.com.br" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/termos-de-uso" className="hover:text-primary transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/politica-de-privacidade" className="hover:text-primary transition-colors">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link to="/politica-de-cookies" className="hover:text-primary transition-colors">
                    Política de Cookies
                  </Link>
                </li>
                <li>
                  <Link to="/lgpd" className="hover:text-primary transition-colors">
                    LGPD
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* UniPay Partnership */}
              <motion.a
                href="https://unipaybr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src={unipayLogo} 
                  alt="UniPay" 
                  className="h-6 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <div className="h-4 w-px bg-border/50" />
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <span>Gateway de Pagamentos</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </motion.a>

              {/* Copyright */}
              <p className="text-sm text-muted-foreground">
                © 2025 Conversy. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Mobile Floating CTA */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-white/5 md:hidden z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/auth" className="block">
          <Button className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/30 cta-button cta-shine rounded-xl">
            Começar Grátis Agora
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </motion.div>

      {/* Add bottom padding on mobile for floating CTA */}
      <div className="h-20 md:hidden" />

      {/* Demo Modal - Lazy loaded */}
      <Suspense fallback={null}>
        <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
      </Suspense>
    </div>
  );
}
