import { 
  Bot, 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp, 
  Zap, 
  Shield,
  CreditCard
} from "lucide-react";

export const features = [
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

export const steps = [
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

export const benefits = [
  { 
    feature: "Automação 100% sem código", 
    conversy: true, 
    whatsapp: false, 
    others: "partial" as const
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
    whatsapp: "partial" as const, 
    others: true 
  },
  { 
    feature: "Funil de upsell automático", 
    conversy: true, 
    whatsapp: false, 
    others: "partial" as const
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

export const testimonials = [
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

export const faqs = [
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
