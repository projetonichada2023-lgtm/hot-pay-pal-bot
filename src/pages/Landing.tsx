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
  Star,
  Rocket,
  Crown
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { motion, useInView, Variants } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
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
    title: "Configure seu Bot",
    description: "Conecte seu bot do Telegram e personalize as mensagens."
  },
  {
    number: "02",
    title: "Cadastre Produtos",
    description: "Adicione seus produtos digitais com preços e descrições."
  },
  {
    number: "03",
    title: "Receba Vendas",
    description: "Seus clientes compram direto no Telegram com PIX."
  }
];

const testimonials = [
  {
    author: {
      name: "Lucas Mendes",
      handle: "@lucasmendes",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=75"
    },
    text: "O TeleGateway revolucionou minhas vendas. Antes eu perdia horas respondendo mensagens, agora tudo é automático. Meu faturamento triplicou em 2 meses!"
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
    text: "Migrei do WhatsApp para o Telegram com o TeleGateway e minhas vendas aumentaram 80%. A automação é outro nível!"
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
    answer: "Não! O TeleGateway foi criado para ser simples. Você só precisa criar um bot no Telegram (com um clique), cadastrar seus produtos e pronto. Não precisa programar nada."
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

// Animation variants - optimized for performance
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

// Scroll reveal component
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
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TeleGateway</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="gap-2">
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
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <Send className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">TeleGateway</span>
                  </div>

                  <nav className="flex flex-col gap-4">
                    <a 
                      href="#features" 
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Recursos
                    </a>
                    <a 
                      href="#how-it-works" 
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Como Funciona
                    </a>
                    <a 
                      href="#testimonials" 
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Depoimentos
                    </a>
                    <a 
                      href="#faq" 
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      FAQ
                    </a>
                  </nav>

                  <div className="border-t border-border pt-6 mt-2 flex flex-col gap-3">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-center gap-2">
                        Começar Grátis
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Demo Button */}
                  <Button 
                    variant="secondary" 
                    className="w-full gap-2 mt-2"
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
          className="hidden md:block absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-2xl will-change-transform"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="hidden md:block absolute top-40 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-2xl will-change-transform"
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
            {/* Disabled spinning animation on mobile */}
            <Zap className="w-4 h-4 md:animate-none" />
            <span className="hidden md:inline">
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Automatize suas vendas no Telegram
              </motion.span>
            </span>
            <span className="md:hidden">Automatize suas vendas no Telegram</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-4xl mx-auto leading-tight mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Venda Produtos Digitais
            <motion.span 
              className="text-primary block mt-2"
              initial={{ opacity: 0, x: -40 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            >
              Direto no Telegram
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Crie seu bot de vendas automatizado com pagamento PIX, entrega instantânea e recuperação de carrinho. Sem código, sem complicação.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link to="/auth" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="gap-2 text-base px-8 w-full sm:w-auto h-14 sm:h-12 text-lg sm:text-base">
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
                className="gap-2 text-base px-8 w-full sm:w-auto h-14 sm:h-12 text-lg sm:text-base"
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
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Lojas Ativas</div>
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

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para vender
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas poderosas para criar, gerenciar e escalar seu negócio digital no Telegram.
            </p>
          </ScrollReveal>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors duration-300 hover:shadow-lg hover:shadow-primary/5 group h-full">
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Em apenas 3 passos simples, sua loja estará pronta para receber vendas.
            </p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <ScrollReveal 
                key={step.number}
                variants={index === 0 ? fadeInLeft : index === 2 ? fadeInRight : fadeInUp}
              >
                <motion.div 
                  className="text-center"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="text-6xl font-bold text-primary/20 mb-4"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 150, 
                      damping: 15,
                      delay: index * 0.2 
                    }}
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Connection line for desktop */}
          <div className="hidden md:block max-w-4xl mx-auto mt-8">
            <motion.div 
              className="h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </section>

      {/* Para Quem é Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Para Quem é o TeleGateway?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ideal para quem quer vender produtos digitais de forma automatizada e profissional.
            </p>
          </ScrollReveal>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Infoprodutores */}
            <motion.div variants={fadeInUp}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative p-8 bg-card/50 backdrop-blur border-border/50 hover:border-violet-500/50 transition-all duration-300 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Infoprodutores</h3>
                  <p className="text-muted-foreground mb-4">
                    Venda cursos, e-books, mentorias e templates direto no Telegram com entrega automática.
                  </p>
                  <ul className="space-y-2">
                    {["Entrega instantânea de arquivos", "Upsell pós-compra automático", "Métricas de conversão"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </motion.div>

            {/* Criadores de Conteúdo */}
            <motion.div variants={fadeInUp}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative p-8 bg-card/50 backdrop-blur border-border/50 hover:border-cyan-500/50 transition-all duration-300 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Criadores de Conteúdo</h3>
                  <p className="text-muted-foreground mb-4">
                    Monetize sua audiência vendendo conteúdo exclusivo direto onde ela já está.
                  </p>
                  <ul className="space-y-2">
                    {["Presets e packs exclusivos", "Aulas e tutoriais premium", "Atendimento automatizado"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </motion.div>

            {/* Comunidades VIP */}
            <motion.div variants={fadeInUp}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative p-8 bg-card/50 backdrop-blur border-border/50 hover:border-amber-500/50 transition-all duration-300 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Comunidades VIP</h3>
                  <p className="text-muted-foreground mb-4">
                    Gerencie acessos a grupos exclusivos com cobrança recorrente ou única.
                  </p>
                  <ul className="space-y-2">
                    {["Acesso automático ao grupo", "Gestão de membros integrada", "Renovação e cancelamento"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher o TeleGateway?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compare e veja as vantagens de vender no Telegram com automação.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur">
              {/* Table Header */}
              <div className="grid grid-cols-4 bg-muted/50 border-b border-border/50">
                <div className="p-4 md:p-6 font-semibold text-sm md:text-base">Recurso</div>
                <div className="p-4 md:p-6 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <Send className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-sm md:text-base text-primary">TeleGateway</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="font-medium text-sm md:text-base text-muted-foreground">WhatsApp</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm md:text-base text-muted-foreground">Hotmart/Kiwify</span>
                  </div>
                </div>
              </div>

              {/* Table Rows */}
              {[
                { feature: "Automação 100% sem código", telegateway: true, whatsapp: false, others: "partial" },
                { feature: "Bot próprio personalizado", telegateway: true, whatsapp: false, others: false },
                { feature: "PIX automático integrado", telegateway: true, whatsapp: false, others: true },
                { feature: "Entrega instantânea", telegateway: true, whatsapp: false, others: true },
                { feature: "Recuperação de carrinho", telegateway: true, whatsapp: "partial", others: true },
                { feature: "Funil de upsell automático", telegateway: true, whatsapp: false, others: "partial" },
                { feature: "Sem mensalidade fixa", telegateway: true, whatsapp: true, others: false },
                { feature: "Taxa por transação baixa", telegateway: true, whatsapp: true, others: false },
                { feature: "Chat direto com cliente", telegateway: true, whatsapp: true, others: false },
                { feature: "Acesso a grupos automático", telegateway: true, whatsapp: false, others: false },
              ].map((row, index) => (
                <motion.div
                  key={row.feature}
                  className={`grid grid-cols-4 border-b border-border/30 last:border-b-0 ${
                    index % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="p-4 md:p-5 text-sm md:text-base font-medium">{row.feature}</div>
                  <div className="p-4 md:p-5 flex justify-center items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 500, delay: index * 0.05 + 0.1 }}
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-emerald-500/20 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                    </motion.div>
                  </div>
                  <div className="p-4 md:p-5 flex justify-center items-center">
                    {row.whatsapp === true ? (
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                      </div>
                    ) : row.whatsapp === "partial" ? (
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Minus className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-destructive/20 flex items-center justify-center">
                        <X className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5 flex justify-center items-center">
                    {row.others === true ? (
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                      </div>
                    ) : row.others === "partial" ? (
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Minus className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-destructive/20 flex items-center justify-center">
                        <X className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                </div>
                <span>Incluso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Minus className="w-3 h-3 text-amber-500" />
                </div>
                <span>Parcial / Manual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="w-3 h-3 text-destructive" />
                </div>
                <span>Não disponível</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Security Badge */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-lg">100% Seguro</p>
                  <p className="text-sm text-muted-foreground">Pagamentos criptografados</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Data Protection Badge */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-lg">Dados Protegidos</p>
                  <p className="text-sm text-muted-foreground">LGPD Compliance</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Support Badge */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Headphones className="w-7 h-7 text-violet-500" />
                </div>
                <div>
                  <p className="font-bold text-lg">Suporte Brasileiro</p>
                  <p className="text-sm text-muted-foreground">Atendimento humanizado</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Transactions Badge */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Activity className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-lg">+5.000/dia</p>
                  <p className="text-sm text-muted-foreground">Transações processadas</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Additional trust indicators */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-6 mt-10 pt-8 border-t border-border/30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <span>Empresa 100% Brasileira</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <span>Sem mensalidade fixa</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <span>Entrega instantânea garantida</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <span>PIX em tempo real</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <ScrollReveal className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4"
            >
              <Zap className="w-4 h-4" />
              Planos flexíveis
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Escolha o plano ideal para
              <span className="text-primary block md:inline md:ml-2">seu negócio</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comece grátis e escale conforme seu negócio cresce. Sem surpresas, sem taxas ocultas.
            </p>
          </ScrollReveal>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Starter Plan */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Card className="relative h-full p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Star className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Starter</h3>
                      <p className="text-sm text-muted-foreground">Para começar a vender</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">Grátis</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">+ 5% por transação</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Até 50 vendas/mês",
                      "1 produto cadastrado",
                      "Bot automatizado",
                      "Pagamento PIX",
                      "Entrega automática",
                      "Suporte via chat"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth" className="block">
                    <Button variant="outline" className="w-full gap-2">
                      Começar Grátis
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            </motion.div>

            {/* Pro Plan - Popular */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Card className="relative h-full p-6 md:p-8 bg-gradient-to-br from-primary/10 via-card to-card border-primary/30 backdrop-blur-sm overflow-hidden">
                  {/* Popular badge */}
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-b-lg">
                      MAIS POPULAR
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6 mt-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Pro</h3>
                      <p className="text-sm text-muted-foreground">Para escalar vendas</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg text-muted-foreground">R$</span>
                      <span className="text-4xl font-bold">97</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">+ 3% por transação</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Vendas ilimitadas",
                      "Produtos ilimitados",
                      "Recuperação de carrinho",
                      "Funil de upsell/downsell",
                      "Relatórios avançados",
                      "Webhooks e API",
                      "Suporte prioritário"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth" className="block">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full gap-2 glow-hot">
                        Assinar Agora
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Link>
                </Card>
              </motion.div>
            </motion.div>

            {/* Business Plan */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Card className="relative h-full p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Business</h3>
                      <p className="text-sm text-muted-foreground">Para grandes operações</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg text-muted-foreground">R$</span>
                      <span className="text-4xl font-bold">297</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">+ 1.5% por transação</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Tudo do Pro, mais:",
                      "Multi-bots (até 5)",
                      "White-label",
                      "Gerente de conta dedicado",
                      "Integrações personalizadas",
                      "SLA de 99.9% uptime",
                      "Suporte 24/7"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth" className="block">
                    <Button variant="outline" className="w-full gap-2">
                      Falar com Vendas
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Money-back guarantee */}
          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-500">
              <Shield className="w-4 h-4" />
              <span>7 dias de garantia incondicional em todos os planos pagos</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <TestimonialsSection
          title="O que nossos clientes dizem"
          description="Milhares de empreendedores já transformaram suas vendas com o TeleGateway."
          testimonials={testimonials}
        />
      </Suspense>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tire suas dúvidas sobre o TeleGateway.
            </p>
          </ScrollReveal>
          
          <ScrollReveal className="max-w-3xl mx-auto">
            <Suspense fallback={<SectionLoader />}>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border-border/50 data-[state=open]:border-primary/30"
                  >
                    <AccordionTrigger className="text-left hover:no-underline hover:text-primary transition-colors py-5 text-base font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Suspense>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <ScrollReveal variants={scaleIn}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 text-center relative overflow-hidden">
                {/* Animated background elements */}
                <motion.div 
                  className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.8, 0.5, 0.8]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                <div className="relative z-10">
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    Pronto para começar?
                  </motion.h2>
                  <motion.p 
                    className="text-muted-foreground text-lg max-w-xl mx-auto mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    Crie sua loja gratuita agora e comece a vender em minutos. Sem taxas mensais, pague apenas por venda.
                  </motion.p>
                  
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Link to="/auth">
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button size="lg" className="gap-2 text-base px-8">
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
                    className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
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
                        variants={fadeInUp}
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
                          <item.icon className="w-4 h-4 text-primary" />
                        </motion.div>
                        {item.text}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="py-12 px-4 border-t border-border/50 bg-muted/20"
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
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Send className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">TeleGateway</span>
              </motion.div>
              <p className="text-sm text-muted-foreground mb-4">
                Automatize suas vendas no Telegram com pagamento PIX, entrega instantânea e recuperação de carrinho.
              </p>
              {/* Social Media */}
              <div className="flex items-center gap-3">
                <motion.a
                  href="https://instagram.com/telegateway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="https://youtube.com/@telegateway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Youtube className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="https://t.me/telegateway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.a>
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
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
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="https://t.me/telegateway_suporte" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    Suporte Telegram
                  </a>
                </li>
                <li>
                  <a href="mailto:suporte@telegateway.com" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
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
          <div className="border-t border-border/50 pt-8">
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
                  alt="UniPay - Gateway de Pagamentos" 
                  className="h-6 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <div className="h-4 w-px bg-border/50" />
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <span>Parceiro de Pagamentos</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </motion.a>

              {/* Copyright */}
              <p className="text-sm text-muted-foreground">
                © 2025 TeleGateway. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Mobile Floating CTA */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border/50 md:hidden z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Link to="/auth" className="block">
          <Button className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/25">
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
