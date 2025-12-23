import { useState, useRef, useEffect } from 'react';
import { useBotMessages, BotMessage } from '@/hooks/useBotMessages';
import { useProducts, Product } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RotateCcw, 
  Send, 
  Bot, 
  User,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  Package,
  ExternalLink,
  Smartphone
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

    // Show products
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
    
    // Auto deliver after delay
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
    
    // Show thank you message
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

    // Process user input based on step
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
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Simulador do Bot
            </CardTitle>
            <CardDescription>
              Teste o fluxo de vendas antes de publicar
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetSimulation}
              disabled={step === 'idle'}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reiniciar
            </Button>
            <Button 
              size="sm"
              onClick={startSimulation}
              className="gradient-hot glow-hot"
              disabled={step !== 'idle'}
            >
              <Play className="w-4 h-4 mr-1" />
              Iniciar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        {/* iPhone-style simulator */}
        <div className="flex-1 flex justify-center p-4 pt-0">
          <div className="w-full max-w-sm">
            {/* iPhone frame */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-b from-zinc-800 to-zinc-900 p-3 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-zinc-900 rounded-b-2xl z-10" />
              
              {/* Screen */}
              <div className="relative rounded-[2rem] overflow-hidden bg-[#17212b] h-[500px] flex flex-col">
                {/* Status bar */}
                <div className="h-10 bg-[#17212b] flex items-center justify-between px-6 pt-2 shrink-0">
                  <span className="text-white/80 text-xs font-medium">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 rounded-sm bg-white/80" />
                  </div>
                </div>
                
                {/* Chat header */}
                <div className="bg-[#232e3c] px-4 py-3 flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">Bot de Vendas</p>
                    <p className="text-[#8e99a4] text-xs">
                      {isTyping ? 'digitando...' : 'online'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary">
                    Simulação
                  </Badge>
                </div>
                
                {/* Messages area */}
                <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
                  <div className="space-y-3">
                    {step === 'idle' && (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                          <Play className="w-8 h-8 text-primary" />
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
                              <span className="bg-[#232e3c] text-[#8e99a4] text-[10px] px-2 py-1 rounded-full">
                                {msg.content}
                              </span>
                            </div>
                          ) : (
                            <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] ${msg.type === 'user' ? '' : ''}`}>
                                {/* Media */}
                                {msg.mediaUrl && (
                                  <div className={`rounded-t-2xl overflow-hidden mb-0.5 ${msg.type === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'}`}>
                                    <img 
                                      src={msg.mediaUrl} 
                                      alt="" 
                                      className="w-full h-24 object-cover"
                                    />
                                  </div>
                                )}
                                
                                {/* Message bubble */}
                                <div className={`p-3 text-sm ${
                                  msg.type === 'user' 
                                    ? 'bg-[#3390ec] text-white rounded-2xl rounded-tr-md' 
                                    : `bg-[#182533] text-white/90 ${msg.mediaUrl ? 'rounded-b-2xl rounded-tr-2xl' : 'rounded-2xl rounded-tl-md'}`
                                }`}>
                                  <p className="whitespace-pre-wrap leading-relaxed text-xs">
                                    {msg.content}
                                  </p>
                                  <span className={`text-[9px] float-right mt-1 ml-2 ${
                                    msg.type === 'user' ? 'text-white/70' : 'text-[#6b7c8a]'
                                  }`}>
                                    {formatTime(msg.timestamp)}
                                    {msg.type === 'user' && ' ✓✓'}
                                  </span>
                                </div>
                                
                                {/* Buttons */}
                                {msg.buttons && msg.buttons.length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    {msg.buttons.map((btn, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          if (btn.value === 'buy') initiatePurchase();
                                        }}
                                        className="w-full py-2 px-3 bg-[#3390ec] hover:bg-[#2b7bc9] text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                      >
                                        {btn.type === 'url' && <ExternalLink className="h-3 w-3" />}
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

                    {/* Typing indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-[#182533] rounded-2xl rounded-tl-md px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-[#6b7c8a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-[#6b7c8a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-[#6b7c8a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Input area */}
                <div className="bg-[#17212b] p-3 border-t border-[#232e3c] shrink-0">
                  <div className="flex items-center gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Digite /start..."
                      className="flex-1 bg-[#242f3d] border-none text-white text-sm placeholder:text-[#6b7c8a] rounded-full h-9"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="w-9 h-9 rounded-full bg-[#3390ec] flex items-center justify-center shrink-0 hover:bg-[#2b7bc9] transition-colors"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        {step !== 'idle' && (
          <div className="border-t border-border p-4 shrink-0">
            <p className="text-xs text-muted-foreground mb-2">Ações Rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {step === 'catalog' && (
                <>
                  <Button size="sm" variant="outline" onClick={showCatalog}>
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    Ver Catálogo
                  </Button>
                  {products.slice(0, 2).map((p) => (
                    <Button 
                      key={p.id} 
                      size="sm" 
                      variant="outline"
                      onClick={() => selectProduct(p)}
                    >
                      <Package className="w-3 h-3 mr-1" />
                      {p.name.substring(0, 15)}
                    </Button>
                  ))}
                </>
              )}
              {step === 'product_selected' && (
                <Button size="sm" variant="outline" onClick={initiatePurchase}>
                  <CreditCard className="w-3 h-3 mr-1" />
                  Comprar
                </Button>
              )}
              {step === 'awaiting_payment' && (
                <Button size="sm" variant="outline" onClick={simulatePayment}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Simular Pagamento
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
