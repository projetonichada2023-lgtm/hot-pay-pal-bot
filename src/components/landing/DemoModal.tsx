import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, ShoppingCart, CreditCard, CheckCircle2, Package } from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const chatMessages = [
  {
    type: "bot",
    content: "Olá! 👋 Bem-vindo à nossa loja!\n\nEscolha um produto para comprar:",
    delay: 0,
  },
  {
    type: "bot",
    content: "📦 **Curso Completo de Marketing**\n💰 R$ 197,00\n\n✅ 50+ aulas em vídeo\n✅ Certificado incluso\n✅ Acesso vitalício",
    delay: 1500,
    hasButton: true,
    buttonText: "🛒 Comprar Agora",
  },
  {
    type: "user",
    content: "🛒 Comprar Agora",
    delay: 3500,
  },
  {
    type: "bot",
    content: "Ótima escolha! 🎉\n\nGerando seu pagamento PIX...",
    delay: 4500,
  },
  {
    type: "bot",
    content: "💳 **Pagamento PIX**\n\nValor: R$ 197,00\n\n[QR CODE PIX]\n\nCopie o código ou escaneie o QR Code para pagar.",
    delay: 6000,
    isPix: true,
  },
  {
    type: "system",
    content: "✅ Pagamento confirmado!",
    delay: 8500,
  },
  {
    type: "bot",
    content: "🎊 Parabéns pela compra!\n\nSeu acesso foi liberado:\n\n🔗 **Link do Curso:**\nhttps://curso.exemplo.com/acesso\n\n📧 Enviamos também por e-mail.\n\nObrigado por comprar conosco! 💚",
    delay: 9500,
  },
];

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (open) {
      setVisibleMessages(0);
      let currentIndex = 0;

      const showNextMessage = () => {
        if (currentIndex < chatMessages.length) {
          const nextMessage = chatMessages[currentIndex];
          const nextDelay = currentIndex === 0 ? 500 : nextMessage.delay - (chatMessages[currentIndex - 1]?.delay || 0);
          
          // Show typing indicator before bot messages
          if (nextMessage.type === "bot") {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setVisibleMessages(currentIndex + 1);
              currentIndex++;
              showNextMessage();
            }, Math.min(nextDelay, 1200));
          } else {
            setTimeout(() => {
              setVisibleMessages(currentIndex + 1);
              currentIndex++;
              showNextMessage();
            }, nextDelay);
          }
        }
      };

      showNextMessage();

      return () => {
        setVisibleMessages(0);
        setIsTyping(false);
      };
    }
  }, [open]);

  const resetDemo = () => {
    setVisibleMessages(0);
    setIsTyping(false);
    setTimeout(() => {
      let currentIndex = 0;
      const showNextMessage = () => {
        if (currentIndex < chatMessages.length) {
          const nextMessage = chatMessages[currentIndex];
          const nextDelay = currentIndex === 0 ? 500 : nextMessage.delay - (chatMessages[currentIndex - 1]?.delay || 0);
          
          if (nextMessage.type === "bot") {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setVisibleMessages(currentIndex + 1);
              currentIndex++;
              showNextMessage();
            }, Math.min(nextDelay, 1200));
          } else {
            setTimeout(() => {
              setVisibleMessages(currentIndex + 1);
              currentIndex++;
              showNextMessage();
            }, nextDelay);
          }
        }
      };
      showNextMessage();
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-background border-border">
        <DialogHeader className="p-4 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Loja Demo Bot</DialogTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Chat area */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-muted/20">
          <AnimatePresence mode="popLayout">
            {chatMessages.slice(0, visibleMessages).map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "system" ? (
                  <div className="flex items-center justify-center w-full">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">
                      {message.content.split("**").map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i}>{part}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </p>
                    
                    {message.isPix && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center">
                          <div className="grid grid-cols-8 gap-0.5 w-28 h-28">
                            {Array.from({ length: 64 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-full aspect-square ${
                                  Math.random() > 0.5 ? "bg-gray-900" : "bg-white"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Válido por 30 minutos
                        </p>
                      </div>
                    )}

                    {message.hasButton && (
                      <motion.button
                        className="mt-3 w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {message.buttonText}
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              <span>Catálogo</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              <span>PIX Automático</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              <span>Entrega Instantânea</span>
            </div>
          </div>
          
          {visibleMessages === chatMessages.length && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={resetDemo}
              className="w-full py-2.5 px-4 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Ver Demonstração Novamente
            </motion.button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
