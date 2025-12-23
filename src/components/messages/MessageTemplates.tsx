import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, Copy, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  style: 'formal' | 'friendly' | 'urgent';
  buttons?: Array<{ text: string; type: 'callback' | 'url'; value: string }>;
}

interface MessageTemplatesProps {
  messageType: string;
  onSelectTemplate: (content: string, buttons?: Template['buttons']) => void;
}

const templatesByType: Record<string, Template[]> = {
  welcome: [
    {
      id: 'welcome-friendly',
      name: 'Amigável',
      description: 'Tom casual e acolhedor',
      style: 'friendly',
      content: `Oi, {primeiro_nome}! 👋

Que bom ter você aqui! 🎉

Sou o assistente virtual da loja e estou pronto para te ajudar a encontrar o produto perfeito.

O que você gostaria de fazer?`,
      buttons: [
        { text: '🛍️ Ver Catálogo', type: 'callback', value: 'catalog' },
        { text: '💬 Falar com Suporte', type: 'callback', value: 'support' },
      ],
    },
    {
      id: 'welcome-professional',
      name: 'Profissional',
      description: 'Tom formal e direto',
      style: 'formal',
      content: `Olá, {nome}!

Bem-vindo à nossa loja. Estou aqui para auxiliá-lo em sua compra.

Navegue pelo nosso catálogo ou entre em contato com nosso suporte caso precise de ajuda.`,
      buttons: [
        { text: 'Ver Produtos', type: 'callback', value: 'catalog' },
        { text: 'Suporte', type: 'callback', value: 'support' },
      ],
    },
    {
      id: 'welcome-promo',
      name: 'Promocional',
      description: 'Destaca ofertas especiais',
      style: 'urgent',
      content: `🔥 Oi, {primeiro_nome}!

Você chegou na hora certa! Temos ofertas IMPERDÍVEIS esperando por você.

🎁 Aproveite descontos exclusivos só para quem está no Telegram!

Confira agora 👇`,
      buttons: [
        { text: '🔥 Ver Ofertas', type: 'callback', value: 'catalog' },
      ],
    },
  ],
  catalog: [
    {
      id: 'catalog-simple',
      name: 'Simples',
      description: 'Lista direta de produtos',
      style: 'formal',
      content: `📦 *Nosso Catálogo*

Confira nossos produtos disponíveis:

Selecione um produto para ver mais detalhes e realizar sua compra.`,
    },
    {
      id: 'catalog-engaging',
      name: 'Engajador',
      description: 'Incentiva a exploração',
      style: 'friendly',
      content: `✨ *Produtos Especiais para Você*

Preparamos uma seleção incrível de produtos!

Cada item foi escolhido a dedo para transformar sua experiência. 

Toque em qualquer produto para conhecer mais detalhes! 👇`,
    },
  ],
  product_detail: [
    {
      id: 'product-complete',
      name: 'Completo',
      description: 'Todas as informações do produto',
      style: 'formal',
      content: `🏷️ *{produto}*

💰 *Valor:* {valor}

Este é um produto digital com entrega instantânea após a confirmação do pagamento.

✅ Acesso imediato
✅ Suporte incluído
✅ Garantia de satisfação`,
      buttons: [
        { text: '🛒 Comprar Agora', type: 'callback', value: 'buy' },
        { text: '← Voltar ao Catálogo', type: 'callback', value: 'catalog' },
      ],
    },
    {
      id: 'product-urgency',
      name: 'Com Urgência',
      description: 'Cria senso de urgência',
      style: 'urgent',
      content: `🔥 *{produto}*

💰 *Por apenas:* {valor}

⚡ OFERTA POR TEMPO LIMITADO!

Garanta agora antes que acabe. Milhares de clientes já aproveitaram!

🎯 Entrega digital imediata
🔒 Pagamento 100% seguro`,
      buttons: [
        { text: '⚡ GARANTIR AGORA', type: 'callback', value: 'buy' },
      ],
    },
  ],
  pix_generated: [
    {
      id: 'pix-instructions',
      name: 'Com Instruções',
      description: 'Passo a passo detalhado',
      style: 'formal',
      content: `💳 *Pagamento PIX Gerado!*

Produto: *{produto}*
Valor: *{valor}*

📋 *Como pagar:*

1️⃣ Abra o app do seu banco
2️⃣ Escolha a opção PIX
3️⃣ Cole o código abaixo
4️⃣ Confirme o pagamento

O código expira em 30 minutos.

Após o pagamento, você receberá seu produto automaticamente! ⚡`,
      buttons: [
        { text: '📋 Copiar Código PIX', type: 'callback', value: 'copy_pix' },
      ],
    },
    {
      id: 'pix-simple',
      name: 'Simples',
      description: 'Direto ao ponto',
      style: 'friendly',
      content: `✅ *PIX Gerado com Sucesso!*

Valor: *{valor}*

Copie o código abaixo e pague via PIX:

Após a confirmação, seu produto será liberado instantaneamente!`,
      buttons: [
        { text: '📋 Copiar PIX', type: 'callback', value: 'copy_pix' },
      ],
    },
  ],
  payment_confirmed: [
    {
      id: 'payment-celebration',
      name: 'Celebração',
      description: 'Tom comemorativo',
      style: 'friendly',
      content: `🎉 *Pagamento Confirmado!*

{primeiro_nome}, seu pagamento foi aprovado com sucesso!

Produto: *{produto}*
Valor: *{valor}*

Estamos preparando sua entrega... ⏳`,
    },
    {
      id: 'payment-formal',
      name: 'Formal',
      description: 'Confirmação profissional',
      style: 'formal',
      content: `✅ *Confirmação de Pagamento*

Olá, {nome}.

Confirmamos o recebimento do seu pagamento:

• Produto: {produto}
• Valor: {valor}
• Status: Aprovado

Seu produto será entregue em instantes.`,
    },
  ],
  delivery: [
    {
      id: 'delivery-digital',
      name: 'Produto Digital',
      description: 'Para infoprodutos',
      style: 'friendly',
      content: `📦 *Entrega Realizada!*

{primeiro_nome}, seu produto está pronto!

🎁 *{produto}*

Clique no botão abaixo para acessar:

Qualquer dúvida, é só me chamar! 💬`,
      buttons: [
        { text: '📥 Acessar Produto', type: 'url', value: '{link_produto}' },
      ],
    },
    {
      id: 'delivery-group',
      name: 'Acesso a Grupo',
      description: 'Para grupos VIP/comunidades',
      style: 'friendly',
      content: `🚀 *Acesso Liberado!*

Parabéns, {primeiro_nome}!

Seu acesso ao *{produto}* foi liberado.

Clique no botão abaixo para entrar no grupo exclusivo:

Te esperamos lá dentro! 🎯`,
      buttons: [
        { text: '🔗 Entrar no Grupo', type: 'url', value: '{link_grupo}' },
      ],
    },
  ],
  thank_you: [
    {
      id: 'thanks-review',
      name: 'Pede Avaliação',
      description: 'Solicita feedback',
      style: 'friendly',
      content: `❤️ *Muito Obrigado!*

{primeiro_nome}, foi um prazer te atender!

Espero que você aproveite muito o *{produto}*.

Se puder, deixe sua avaliação. Isso nos ajuda muito! ⭐

Qualquer dúvida, estarei por aqui! 🤗`,
      buttons: [
        { text: '⭐ Deixar Avaliação', type: 'url', value: '{link_avaliacao}' },
        { text: '🛍️ Ver Mais Produtos', type: 'callback', value: 'catalog' },
      ],
    },
    {
      id: 'thanks-simple',
      name: 'Simples',
      description: 'Agradecimento direto',
      style: 'formal',
      content: `✅ *Obrigado pela sua compra!*

{nome}, agradecemos a preferência.

Seu produto *{produto}* já foi entregue.

Volte sempre! 🙏`,
    },
  ],
  cart_reminder: [
    {
      id: 'reminder-friendly',
      name: 'Amigável',
      description: 'Lembrete gentil',
      style: 'friendly',
      content: `Oi, {primeiro_nome}! 👋

Vi que você deixou o *{produto}* esperando...

O pagamento ainda não foi confirmado. Posso te ajudar com alguma coisa?

Seu pedido ainda está reservado! 🛒`,
      buttons: [
        { text: '💳 Finalizar Compra', type: 'callback', value: 'retry_payment' },
        { text: '❓ Preciso de Ajuda', type: 'callback', value: 'support' },
      ],
    },
    {
      id: 'reminder-urgency',
      name: 'Com Urgência',
      description: 'Cria senso de urgência',
      style: 'urgent',
      content: `⚠️ {primeiro_nome}, seu pedido vai expirar!

O *{produto}* ainda está no seu carrinho, mas não por muito tempo...

⏰ Finalize agora antes que outra pessoa garanta!

Valor: *{valor}*`,
      buttons: [
        { text: '⚡ Finalizar Agora', type: 'callback', value: 'retry_payment' },
      ],
    },
  ],
  upsell: [
    {
      id: 'upsell-complement',
      name: 'Complementar',
      description: 'Produto que complementa',
      style: 'friendly',
      content: `🎯 *Oferta Especial para Você!*

{primeiro_nome}, já que você levou o *{produto}*, tenho uma oferta imperdível!

Clientes que compraram esse produto também adoraram este aqui 👇

🔥 Com desconto exclusivo só para você!`,
      buttons: [
        { text: '✅ Quero Aproveitar', type: 'callback', value: 'accept_upsell' },
        { text: '❌ Não, Obrigado', type: 'callback', value: 'decline_upsell' },
      ],
    },
    {
      id: 'upsell-bundle',
      name: 'Combo/Bundle',
      description: 'Oferta de pacote',
      style: 'urgent',
      content: `💎 *OFERTA ÚNICA!*

{primeiro_nome}, você desbloqueou uma oferta exclusiva!

Leve o combo completo com desconto especial:

✅ Acesso vitalício
✅ Bônus exclusivos
✅ Suporte prioritário

⏰ Válido apenas agora!`,
      buttons: [
        { text: '🔥 QUERO O COMBO', type: 'callback', value: 'accept_upsell' },
        { text: 'Não preciso', type: 'callback', value: 'decline_upsell' },
      ],
    },
  ],
  downsell: [
    {
      id: 'downsell-alternative',
      name: 'Alternativa',
      description: 'Oferece opção mais acessível',
      style: 'friendly',
      content: `Entendo, {primeiro_nome}! 🤝

Que tal uma opção mais acessível?

Tenho algo especial que pode te interessar, com um investimento menor:

Vale a pena conferir! 👇`,
      buttons: [
        { text: '👀 Ver Oferta', type: 'callback', value: 'view_downsell' },
        { text: '❌ Não, Obrigado', type: 'callback', value: 'decline_downsell' },
      ],
    },
  ],
  support: [
    {
      id: 'support-queue',
      name: 'Fila de Atendimento',
      description: 'Informa sobre atendimento',
      style: 'formal',
      content: `💬 *Suporte ao Cliente*

Olá, {primeiro_nome}!

Recebi sua solicitação de atendimento.

Um de nossos atendentes irá te responder em breve.

⏰ Horário de atendimento:
Seg a Sex: 9h às 18h

Aguarde, por favor! 🙏`,
    },
    {
      id: 'support-faq',
      name: 'Com FAQ',
      description: 'Direciona para perguntas frequentes',
      style: 'friendly',
      content: `Oi, {primeiro_nome}! 

Estou aqui para te ajudar! 💪

Antes de falar com um atendente, confira se sua dúvida está nas perguntas frequentes:

Se não encontrar, é só me chamar! 😊`,
      buttons: [
        { text: '❓ Perguntas Frequentes', type: 'url', value: '{link_faq}' },
        { text: '👤 Falar com Atendente', type: 'callback', value: 'human_support' },
      ],
    },
  ],
  order_created: [
    {
      id: 'order-created-default',
      name: 'Padrão',
      description: 'Confirmação de pedido',
      style: 'formal',
      content: `🛒 *Pedido Criado!*

{primeiro_nome}, seu pedido foi registrado com sucesso!

📦 Produto: *{produto}*
💰 Valor: *{valor}*
🔢 Pedido: *{pedido_id}*

Aguardando confirmação do pagamento...`,
    },
  ],
  order_cancelled: [
    {
      id: 'order-cancelled-default',
      name: 'Padrão',
      description: 'Aviso de cancelamento',
      style: 'formal',
      content: `❌ *Pedido Cancelado*

{primeiro_nome}, seu pedido foi cancelado.

Pedido: *{pedido_id}*
Motivo: Pagamento não confirmado

Se foi um engano, você pode fazer um novo pedido a qualquer momento!`,
      buttons: [
        { text: '🛍️ Ver Catálogo', type: 'callback', value: 'catalog' },
      ],
    },
  ],
  no_products: [
    {
      id: 'no-products-default',
      name: 'Padrão',
      description: 'Quando não há produtos',
      style: 'friendly',
      content: `😕 *Ops!*

Desculpe, {primeiro_nome}!

No momento não temos produtos disponíveis.

Mas fique ligado! Em breve teremos novidades! 🚀

Enquanto isso, siga-nos nas redes sociais!`,
    },
  ],
};

const styleColors: Record<string, { bg: string; text: string; label: string }> = {
  formal: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Formal' },
  friendly: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Amigável' },
  urgent: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Urgente' },
};

export const MessageTemplates = ({ messageType, onSelectTemplate }: MessageTemplatesProps) => {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<string>('all');

  const templates = templatesByType[messageType] || [];
  
  const filteredTemplates = activeStyle === 'all' 
    ? templates 
    : templates.filter(t => t.style === activeStyle);

  const handleSelect = (template: Template) => {
    onSelectTemplate(template.content, template.buttons);
    setCopiedId(template.id);
    setTimeout(() => {
      setCopiedId(null);
      setOpen(false);
    }, 500);
  };

  if (templates.length === 0) return null;

  const availableStyles = [...new Set(templates.map(t => t.style))];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Usar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Templates de Mensagem
          </DialogTitle>
          <DialogDescription>
            Escolha um template pronto para começar rapidamente
          </DialogDescription>
        </DialogHeader>

        {availableStyles.length > 1 && (
          <Tabs value={activeStyle} onValueChange={setActiveStyle} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">Todos</TabsTrigger>
              {availableStyles.map(style => (
                <TabsTrigger key={style} value={style} className="capitalize">
                  {styleColors[style].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="grid gap-3 py-2">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div 
                  className="group relative border border-border/50 rounded-xl p-4 hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer"
                  onClick={() => handleSelect(template)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] ${styleColors[template.style].bg} ${styleColors[template.style].text}`}
                      >
                        {styleColors[template.style].label}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(template);
                      }}
                    >
                      {copiedId === template.id ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1" />
                          Usar
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {template.description}
                  </p>

                  {/* Preview */}
                  <div className="bg-[#182533] rounded-lg p-3 text-sm text-white/80 whitespace-pre-wrap line-clamp-4 font-mono text-xs">
                    {template.content}
                  </div>

                  {/* Buttons preview */}
                  {template.buttons && template.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {template.buttons.map((btn, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-normal">
                          {btn.text}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
