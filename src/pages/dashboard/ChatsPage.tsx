import { useState, useRef, useEffect, useMemo } from 'react';
import { Client } from '@/hooks/useClient';
import { useTelegramConversations, TelegramMessage } from '@/hooks/useTelegramMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, User, ArrowLeft, Search, Clock, CheckCheck, Send, Bot, UserCircle, Image, FileText, Mic, Video } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatsPageProps {
  client: Client;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'HH:mm', { locale: ptBR });
}

function formatConversationDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: ptBR });
  }
  if (isYesterday(date)) {
    return 'Ontem';
  }
  return format(date, 'dd/MM', { locale: ptBR });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return 'Hoje';
  }
  if (isYesterday(date)) {
    return 'Ontem';
  }
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getMessageTypeIcon(type: string) {
  switch (type) {
    case 'photo':
      return <Image className="w-3 h-3" />;
    case 'document':
      return <FileText className="w-3 h-3" />;
    case 'voice':
      return <Mic className="w-3 h-3" />;
    case 'video':
      return <Video className="w-3 h-3" />;
    default:
      return null;
  }
}

function getLastMessagePreview(conv: { last_message: string | null; messages: TelegramMessage[] }): string {
  const lastMsg = conv.messages[conv.messages.length - 1];
  if (!lastMsg) return 'Sem mensagem';
  
  if (lastMsg.message_type === 'photo') return '📷 Foto';
  if (lastMsg.message_type === 'document') return '📄 Documento';
  if (lastMsg.message_type === 'voice') return '🎤 Áudio';
  if (lastMsg.message_type === 'video') return '🎬 Vídeo';
  if (lastMsg.message_type === 'sticker') return '🎨 Sticker';
  
  return lastMsg.message_content || conv.last_message || 'Sem mensagem';
}

export const ChatsPage = ({ client }: ChatsPageProps) => {
  const { data: conversations, isLoading } = useTelegramConversations(client.id);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const selectedChat = conversations?.find((c) => c.customer_id === selectedChatId) || null;
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.customer_name.toLowerCase().includes(query) ||
      conv.customer_username?.toLowerCase().includes(query) ||
      conv.messages.some(m => m.message_content?.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    if (!conversations) return { total: 0, today: 0, messages: 0 };
    
    const todayCount = conversations.filter(c => isToday(new Date(c.last_message_at))).length;
    const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);
    
    return { total: conversations.length, today: todayCount, messages: totalMessages };
  }, [conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Carregando conversas...</p>
      </div>
    );
  }

  const hasConversations = conversations && conversations.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            Conversas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Histórico de conversas do Telegram com seus clientes
          </p>
        </div>
        
        {hasConversations && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-sm">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="font-medium">{stats.total}</span>
              <span className="text-muted-foreground">conversas</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-sm">
              <Send className="w-4 h-4 text-green-500" />
              <span className="font-medium">{stats.messages}</span>
              <span className="text-muted-foreground">mensagens</span>
            </div>
          </div>
        )}
      </div>

      {!hasConversations ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 ring-4 ring-primary/10">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhuma conversa ainda</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Quando clientes interagirem com seu bot no Telegram, as conversas aparecerão aqui automaticamente.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Conversations List */}
          <AnimatePresence mode="wait">
            <motion.div
              key="conversations-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "lg:col-span-4 xl:col-span-3",
                selectedChat && "hidden lg:block"
              )}
            >
              <Card className="glass-card h-full overflow-hidden flex flex-col">
                <CardHeader className="pb-3 border-b shrink-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Conversas</CardTitle>
                    {stats.today > 0 && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        {stats.today} hoje
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou mensagem..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="divide-y divide-border/30">
                      <AnimatePresence>
                        {filteredConversations.map((conv, index) => (
                          <motion.button
                            key={conv.customer_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => setSelectedChatId(conv.customer_id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-4 transition-all text-left group",
                              "hover:bg-secondary/60",
                              selectedChat?.customer_id === conv.customer_id && "bg-primary/5 border-l-2 border-l-primary"
                            )}
                          >
                            <div className="relative">
                              <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background transition-transform group-hover:scale-105">
                                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-sm font-semibold">
                                  {getInitials(conv.customer_name)}
                                </AvatarFallback>
                              </Avatar>
                              {isToday(new Date(conv.last_message_at)) && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="font-semibold text-sm truncate">
                                  {conv.customer_name}
                                </span>
                                <span className="text-[11px] text-muted-foreground shrink-0">
                                  {formatConversationDate(conv.last_message_at)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground truncate flex-1 flex items-center gap-1">
                                  {conv.messages[conv.messages.length - 1]?.direction === 'outgoing' && (
                                    <CheckCheck className="w-3 h-3 text-primary shrink-0" />
                                  )}
                                  {getLastMessagePreview(conv)}
                                </p>
                                <Badge variant="outline" className="text-[10px] shrink-0 font-normal opacity-60">
                                  {conv.messages.length}
                                </Badge>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                      
                      {filteredConversations.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
                          <p className="text-xs mt-1">Tente buscar por outro termo</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Chat Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "lg:col-span-8 xl:col-span-9",
              !selectedChat && "hidden lg:block"
            )}
          >
            <Card className="glass-card h-full flex flex-col overflow-hidden">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b py-3 px-4 shrink-0 bg-gradient-to-r from-secondary/30 to-transparent">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden shrink-0 -ml-2"
                        onClick={() => setSelectedChatId(null)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-semibold">
                          {getInitials(selectedChat.customer_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base truncate">{selectedChat.customer_name}</CardTitle>
                          {isToday(new Date(selectedChat.last_message_at)) && (
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {selectedChat.customer_username && (
                            <span>@{selectedChat.customer_username}</span>
                          )}
                          <span>•</span>
                          <span>
                            Ativo {formatDistanceToNow(new Date(selectedChat.last_message_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="shrink-0">
                            {selectedChat.messages.length} msg
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Total de mensagens nesta conversa
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="p-0 flex-1 overflow-hidden relative">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--secondary)/0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
                    
                    <ScrollArea className="h-full relative" ref={scrollAreaRef}>
                      <div className="flex flex-col gap-0.5 p-4 pb-6">
                        <AnimatePresence>
                          {selectedChat.messages.map((msg, index) => {
                            const prevMsg = selectedChat.messages[index - 1];
                            const showDateSeparator = !prevMsg || !isSameDay(new Date(msg.created_at), new Date(prevMsg.created_at));
                            const isFirstFromSender = !prevMsg || prevMsg.direction !== msg.direction;
                            
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {showDateSeparator && (
                                  <div className="flex items-center justify-center my-6">
                                    <div className="bg-secondary/90 backdrop-blur-sm text-muted-foreground text-xs px-4 py-1.5 rounded-full shadow-sm border border-border/50">
                                      {formatDateSeparator(msg.created_at)}
                                    </div>
                                  </div>
                                )}
                                <MessageBubble 
                                  message={msg} 
                                  isFirstFromSender={isFirstFromSender}
                                />
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Footer info */}
                  <div className="border-t px-4 py-2 bg-secondary/20 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Mensagens automáticas do bot • Somente visualização</span>
                  </div>
                </>
              ) : (
                <CardContent className="flex flex-col items-center justify-center flex-1 py-16">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary/80 to-secondary/30 flex items-center justify-center mb-6 mx-auto ring-4 ring-secondary/50">
                      <UserCircle className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Escolha uma conversa da lista para visualizar o histórico de mensagens
                    </p>
                  </motion.div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

function MessageBubble({ message, isFirstFromSender }: { message: TelegramMessage; isFirstFromSender: boolean }) {
  const isOutgoing = message.direction === 'outgoing';
  const typeIcon = getMessageTypeIcon(message.message_type);

  return (
    <div className={cn(
      "flex",
      isFirstFromSender ? "mt-3" : "mt-0.5",
      isOutgoing ? "justify-end" : "justify-start"
    )}>
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative group",
          isOutgoing
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border/50 rounded-bl-sm"
        )}
      >
        {/* Message type indicator */}
        {typeIcon && (
          <div className={cn(
            "flex items-center gap-1.5 mb-1.5 text-xs",
            isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {typeIcon}
            <span className="capitalize">{message.message_type}</span>
          </div>
        )}
        
        <p className={cn(
          "text-sm whitespace-pre-wrap break-words leading-relaxed",
          !message.message_content && "italic opacity-70"
        )}>
          {message.message_content || `[${message.message_type}]`}
        </p>
        
        <div className={cn(
          "flex items-center justify-end gap-1.5 mt-1.5 -mb-0.5",
          isOutgoing ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          <span className="text-[10px]">
            {formatMessageTime(message.created_at)}
          </span>
          {isOutgoing && (
            <CheckCheck className="w-3.5 h-3.5" />
          )}
        </div>

        {/* Sender indicator for first message */}
        {isFirstFromSender && (
          <div className={cn(
            "absolute -top-5 text-[10px] font-medium",
            isOutgoing ? "right-0 text-primary/70" : "left-0 text-muted-foreground"
          )}>
            {isOutgoing ? (
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" /> Bot
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> Cliente
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
