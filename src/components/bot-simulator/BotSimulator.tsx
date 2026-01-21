import { useState, useRef, useEffect } from 'react';
import { useBotMessages, BotMessage } from '@/hooks/useBotMessages';
import { useProducts, Product } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RotateCcw, 
  Send, 
  Bot, 
  ShoppingBag,
  CreditCard,
  CheckCircle,
  Package,
  Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulatorMessage {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  buttons?: Array<{ text: string; type: string; value: string }>;
  timestamp: Date;
}

type SimulatorStep = 
  | 'idle'
  | 'welcome'
  | 'catalog'
  | 'product_selected'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'delivered';

interface BotSimulatorProps {
  clientId: string;
}

export const BotSimulator = ({ clientId }: BotSimulatorProps) => {
  const { data: botMessages = [] } = useBotMessages(clientId);
  const { data: products = [] } = useProducts(clientId);
  
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [step, setStep] = useState<SimulatorStep>('idle');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (content: string, extras?: Partial<SimulatorMessage>): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          type: 'bot',
          content,
          timestamp: new Date(),
          ...extras
        }]);
        resolve();
      }, 800 + Math.random() * 500);
    });
  };

  const sendMultipleMessages = async (
    msgs: BotMessage[], 
    product?: Product | null,
    defaultMessage?: string,
    defaultExtras?: Partial<SimulatorMessage>
  ) => {
    if (msgs.length > 0) {
      for (const msg of msgs) {
        await addBotMessage(processPlaceholders(msg.message_content, product), {
          mediaUrl: msg.media_url,
          mediaType: msg.media_type,
          buttons: msg.buttons as any || undefined
        });
      }
    } else if (defaultMessage) {
      await addBotMessage(defaultMessage, defaultExtras);
    }
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'system',
      content,
      timestamp: new Date()
    }]);
  };

  const getMessagesByType = (type: string): BotMessage[] => {
    return botMessages
      .filter(m => m.message_type === type && m.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const processPlaceholders = (content: string, product?: Product | null): string => {
    let processed = content;
    processed = processed.replace(/\{nome\}/g, 'João');
    processed = processed.replace(/\{primeiro_nome\}/g, 'João');
    if (product) {
      processed = processed.replace(/\{produto\}/g, product.name);
      processed = processed.replace(/\{valor\}/g, `R$ ${product.price.toFixed(2).replace('.', ',')}`);
    }
    return processed;
  };

  const startSimulation = async () => {
    setMessages([]);
    setStep('welcome');
    setSelectedProduct(null);
    
    addSystemMessage('🎬 Simulação iniciada - Cliente enviou /start');
    
    const welcomeMsgs = getMessagesByType('welcome');
    
    setTimeout(async () => {
      if (welcomeMsgs.length > 0) {
        for (const msg of welcomeMsgs) {
          await addBotMessage(processPlaceholders(msg.message_content), {
            mediaUrl: msg.media_url,
            mediaType: msg.media_type,
            buttons: msg.buttons as any || undefined
          });
        }
      } else {
        await addBotMessage('Olá! Bem-vindo à nossa loja! 👋');
      }
      setStep('catalog');
    }, 500);
  };

  const showCatalog = async () => {
    addUserMessage('Ver catálogo');
    
    const catalogMsgs = getMessagesByType('catalog');
    for (const msg of catalogMsgs) {
      await addBotMessage(processPlaceholders(msg.message_content), {
        mediaUrl: msg.media_url,
        mediaType: msg.media_type,
      });
    }

    setTimeout(() => {
      if (products.length > 0) {
        const productList = products.slice(0, 3).map((p, i) => 
          `${i + 1}. *${p.name}* - R$ ${p.price.toFixed(2).replace('.', ',')}`
        ).join('\n');
        addBotMessage(`📦 *Nossos Produtos:*\n\n${productList}\n\nDigite o número do produto para ver mais detalhes!`);
      } else {
        addBotMessage('Ainda não há produtos cadastrados.');
      }
    }, catalogMsgs.length > 0 ? 500 : 0);
  };

  const selectProduct = async (product: Product) => {
    setSelectedProduct(product);
    addUserMessage(`Ver ${product.name}`);
    
    const productDetailMsgs = getMessagesByType('product_detail');
    if (productDetailMsgs.length > 0) {
      for (const msg of productDetailMsgs) {
        await addBotMessage(processPlaceholders(msg.message_content, product), {
          mediaUrl: product.image_url || msg.media_url,
          mediaType: 'image',
          buttons: [{ text: '🛒 Comprar Agora', type: 'callback', value: 'buy' }]
        });
      }
    } else {
      await addBotMessage(
        `*${product.name}*\n\n${product.description || 'Produto incrível!'}\n\n💰 *Preço:* R$ ${product.price.toFixed(2).replace('.', ',')}`,
        {
          mediaUrl: product.image_url,
          mediaType: 'image',
          buttons: [{ text: '🛒 Comprar Agora', type: 'callback', value: 'buy' }]
        }
      );
    }
    setStep('product_selected');
  };

  const initiatePurchase = async () => {
    addUserMessage('Comprar');
    addSystemMessage('⏳ Gerando código PIX...');
    
    const pixMsgs = getMessagesByType('pix_generated');
    if (pixMsgs.length > 0 && selectedProduct) {
      for (const msg of pixMsgs) {
        await addBotMessage(processPlaceholders(msg.message_content, selectedProduct), {
          buttons: [{ text: '📋 Copiar código PIX', type: 'callback', value: 'copy_pix' }]
        });
      }
    } else if (selectedProduct) {
      await addBotMessage(
        `*Pagamento via PIX* 💰\n\nValor: R$ ${selectedProduct.price.toFixed(2).replace('.', ',')}\n\nCopie o código abaixo para pagar:\n\n\`00020126580014br.gov.bcb.pix...\``,
        { buttons: [{ text: '📋 Copiar código PIX', type: 'callback', value: 'copy_pix' }] }
      );
    }
    setStep('awaiting_payment');
  };

  const simulatePayment = async () => {
    addSystemMessage('✅ Pagamento confirmado!');
    
    const paymentConfirmedMsgs = getMessagesByType('payment_confirmed');
    if (paymentConfirmedMsgs.length > 0 && selectedProduct) {
      for (const msg of paymentConfirmedMsgs) {
        await addBotMessage(processPlaceholders(msg.message_content, selectedProduct));
      }
    } else {
      await addBotMessage('🎉 *Pagamento confirmado!*\n\nSeu pedido foi aprovado. Estamos preparando a entrega...');
    }
    setStep('payment_confirmed');
    
    setTimeout(() => {
      deliverProduct();
    }, 2000);
  };

  const deliverProduct = async () => {
    addSystemMessage('📦 Entrega automática realizada');
    
    const deliveryMsgs = getMessagesByType('delivery');
    if (deliveryMsgs.length > 0 && selectedProduct) {
      for (const msg of deliveryMsgs) {
        await addBotMessage(processPlaceholders(msg.message_content, selectedProduct), {
          buttons: selectedProduct.file_url 
            ? [{ text: '📥 Baixar Produto', type: 'url', value: selectedProduct.file_url }]
            : undefined
        });
      }
    } else {
      await addBotMessage(
        '📦 *Entrega realizada!*\n\nSeu produto está disponível para download:',
        { buttons: [{ text: '📥 Baixar Produto', type: 'url', value: '#' }] }
      );
    }
    
    setTimeout(async () => {
      const thankYouMsgs = getMessagesByType('thank_you');
      if (thankYouMsgs.length > 0) {
        for (const msg of thankYouMsgs) {
          await addBotMessage(processPlaceholders(msg.message_content, selectedProduct));
        }
      } else {
        await addBotMessage('❤️ *Obrigado pela compra!*\n\nEsperamos que aproveite seu produto. Volte sempre!');
      }
      setStep('delivered');
    }, 1500);
  };

  const resetSimulation = () => {
    setMessages([]);
    setStep('idle');
    setSelectedProduct(null);
    setInputValue('');
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const msg = inputValue.trim().toLowerCase();
    addUserMessage(inputValue);
    setInputValue('');

    if (msg === '/start' || msg === 'start') {
      startSimulation();
    } else if (step === 'catalog' && products.length > 0) {
      const num = parseInt(msg);
      if (num >= 1 && num <= products.length) {
        selectProduct(products[num - 1]);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="section-title text-base sm:text-lg flex items-center gap-2">
              <Signal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" strokeWidth={1.5} />
              Simulador do Bot
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Teste o fluxo de vendas antes de publicar
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetSimulation}
              disabled={step === 'idle'}
              className="flex-1 sm:flex-none border-border/50 hover:bg-muted/30"
            >
              <RotateCcw className="w-4 h-4 sm:mr-1.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Reiniciar</span>
            </Button>
            <Button 
              size="sm"
              onClick={startSimulation}
              className="gradient-hot flex-1 sm:flex-none shadow-lg shadow-primary/20"
              disabled={step !== 'idle'}
            >
              <Play className="w-4 h-4 sm:mr-1.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Iniciar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Simulator Content */}
      <div className="flex-1 flex justify-center p-4 sm:p-6 pt-2 min-h-0">
        <div className="w-full max-w-sm">
          {/* Premium Device Frame */}
          <div className="device-frame rounded-[2.5rem] sm:rounded-[3rem] p-3 sm:p-4">
            {/* Dynamic Island */}
            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-7 sm:h-8 bg-black rounded-full z-10 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-800" />
              <div className="w-3 h-3 rounded-full bg-zinc-900 ring-1 ring-zinc-700" />
            </div>
            
            {/* Screen */}
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-[#0e1621] h-[420px] sm:h-[520px] flex flex-col">
              {/* Status bar */}
              <div className="h-12 bg-[#0e1621] flex items-center justify-between px-6 pt-3 shrink-0">
                <span className="text-white/70 text-xs font-medium">9:41</span>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3.5 h-3.5 text-white/70" strokeWidth={2} />
                  <div className="w-5 h-2.5 rounded-sm bg-white/70 relative">
                    <div className="absolute inset-0.5 right-1 bg-success rounded-sm" />
                  </div>
                </div>
              </div>
              
              {/* Chat header */}
              <div className="bg-[#17212b] px-4 py-3 flex items-center gap-3 shrink-0 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-foreground/20 flex items-center justify-center ring-2 ring-primary/20">
                  <Bot className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">Bot de Vendas</p>
                  <p className="text-[#8e99a4] text-xs">
                    {isTyping ? 'digitando...' : 'online'}
                  </p>
                </div>
                <Badge className="text-[9px] bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
                  Simulação
                </Badge>
              </div>
              
              {/* Messages area */}
              <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
                <div className="space-y-3">
                  {step === 'idle' && (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
                        <Play className="w-7 h-7 text-primary" strokeWidth={1.5} />
                      </div>
                      <p className="text-[#8e99a4] text-sm">
                        Clique em "Iniciar" para<br />começar a simulação
                      </p>
                    </div>
                  )}

                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {msg.type === 'system' ? (
                          <div className="flex justify-center">
                            <span className="bg-white/5 text-[#8e99a4] text-[10px] px-3 py-1 rounded-full border border-white/5">
                              {msg.content}
                            </span>
                          </div>
                        ) : (
                          <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[85%]">
                              {msg.mediaUrl && (
                                <div className={`rounded-t-2xl overflow-hidden mb-0.5 ${msg.type === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'}`}>
                                  <img 
                                    src={msg.mediaUrl} 
                                    alt="" 
                                    className="w-full h-24 object-cover"
                                  />
                                </div>
                              )}
                              
                              <div className={`p-3 text-sm ${
                                msg.type === 'user' 
                                  ? 'bg-primary text-white rounded-2xl rounded-tr-md' 
                                  : `bg-[#182533] text-white/90 ${msg.mediaUrl ? 'rounded-b-2xl rounded-tr-2xl' : 'rounded-2xl rounded-tl-md'}`
                              }`}>
                                <p className="whitespace-pre-wrap leading-relaxed text-xs">
                                  {msg.content}
                                </p>
                                <span className={`text-[9px] float-right mt-1 ml-2 ${
                                  msg.type === 'user' ? 'text-white/60' : 'text-[#6b7c8a]'
                                }`}>
                                  {formatTime(msg.timestamp)}
                                  {msg.type === 'user' && ' ✓✓'}
                                </span>
                              </div>
                              
                              {msg.buttons && msg.buttons.length > 0 && (
                                <div className="mt-1.5 space-y-1">
                                  {msg.buttons.map((btn, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        if (btn.value === 'buy') initiatePurchase();
                                      }}
                                      className="w-full py-2.5 px-4 bg-primary/90 hover:bg-primary text-white text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
                                    >
                                      {btn.text}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[#182533] px-4 py-3 rounded-2xl rounded-tl-md">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-[#8e99a4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-[#8e99a4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-[#8e99a4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              {step !== 'idle' && (
                <div className="px-3 py-2 border-t border-white/5">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {step === 'catalog' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="shrink-0 h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        onClick={showCatalog}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                        Ver Catálogo
                      </Button>
                    )}
                    {step === 'awaiting_payment' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="shrink-0 h-8 text-xs bg-success/10 border-success/30 hover:bg-success/20 text-success"
                        onClick={simulatePayment}
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                        Simular Pagamento
                      </Button>
                    )}
                    {step === 'delivered' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="shrink-0 h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        onClick={resetSimulation}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                        Nova Simulação
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Input area */}
              <div className="p-2.5 border-t border-white/5 bg-[#17212b]">
                <div className="flex items-center gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 h-10 bg-[#242f3d] border-0 text-white placeholder:text-[#6b7c8a] text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                  <Button 
                    size="icon" 
                    className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
