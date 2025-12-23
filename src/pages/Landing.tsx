import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";
import { 
  Bot, 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp, 
  Zap, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Send
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView, Variants } from "framer-motion";
import { useRef, useEffect } from "react";

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
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "O TeleGateway revolucionou minhas vendas. Antes eu perdia horas respondendo mensagens, agora tudo é automático. Meu faturamento triplicou em 2 meses!"
  },
  {
    author: {
      name: "Ana Carolina",
      handle: "@anacarolina",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "A recuperação de carrinho é incrível! Recupero em média 30% das vendas abandonadas. O investimento se paga no primeiro dia."
  },
  {
    author: {
      name: "Pedro Silva",
      handle: "@pedrosilva",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    text: "Simplicidade é a palavra. Configurei minha loja em menos de 10 minutos e já comecei a vender. O suporte é excepcional!"
  },
  {
    author: {
      name: "Mariana Costa",
      handle: "@maricosta",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "O funil de upsell aumentou meu ticket médio em 45%. Meus clientes compram mais sem eu precisar fazer nada."
  },
  {
    author: {
      name: "Rafael Santos",
      handle: "@rafaelsantos",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    text: "Migrei do WhatsApp para o Telegram com o TeleGateway e minhas vendas aumentaram 80%. A automação é outro nível!"
  },
  {
    author: {
      name: "Julia Fernandes",
      handle: "@juliafernandes",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
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

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
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
          <div className="flex items-center gap-3">
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
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        {/* Animated background blobs */}
        <motion.div 
          className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
            Automatize suas vendas no Telegram
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
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="gap-2 text-base px-8">
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                <MessageCircle className="w-5 h-5" />
                Ver Demonstração
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
            variants={staggerContainer}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
          >
            {[
              { value: "500+", label: "Lojas Ativas" },
              { value: "R$2M+", label: "Vendas Processadas" },
              { value: "98%", label: "Satisfação" }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                variants={scaleIn}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-primary"
                  initial={{ scale: 0 }}
                  animate={heroInView ? { scale: 1 } : {}}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 10,
                    delay: 0.8 + index * 0.1 
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
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

      {/* Testimonials Section */}
      <TestimonialsSection
        title="O que nossos clientes dizem"
        description="Milhares de empreendedores já transformaram suas vendas com o TeleGateway."
        testimonials={testimonials}
      />

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
        className="py-8 px-4 border-t border-border/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Send className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">TeleGateway</span>
          </motion.div>
          <p className="text-sm text-muted-foreground">
            © 2024 TeleGateway. Todos os direitos reservados.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
