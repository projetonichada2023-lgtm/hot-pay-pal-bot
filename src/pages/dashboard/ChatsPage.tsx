import { useState, useRef, useEffect } from 'react';
import { Client } from '@/hooks/useClient';
import { useTelegramConversations, ChatConversation, TelegramMessage } from '@/hooks/useTelegramMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, User, ArrowLeft, Search, Clock, CheckCheck } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  return format(date, "d 'de' MMMM", { locale: ptBR });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const ChatsPage = ({ client }: ChatsPageProps) => {
  const { data: conversations, isLoading } = useTelegramConversations(client.id);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations?.filter(conv => 
    conv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.customer_username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasConversations = conversations && conversations.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Conversas do Telegram
          </h1>
          <p className="text-muted-foreground">
            Visualize as conversas do seu bot com os clientes
          </p>
        </div>
        {hasConversations && (
          <Badge variant="secondary" className="text-sm">
            {conversations.length} conversa{conversations.length !== 1 && 's'}
          </Badge>
        )}
      </div>

      {!hasConversations ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma conversa ainda</h3>
            <p className="text-muted-foreground text-center max-w-md">
              As conversas aparecerão aqui quando clientes interagirem com seu bot no Telegram.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Conversations List */}
          <Card className={cn("glass-card lg:col-span-1 overflow-hidden", selectedChat && "hidden lg:flex lg:flex-col")}>
            <CardHeader className="pb-3 border-b shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="divide-y divide-border/50">
                  {filteredConversations?.map((conv) => (
                    <button
                      key={conv.customer_id}
                      onClick={() => setSelectedChat(conv)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 transition-colors text-left",
                        "hover:bg-secondary/60",
                        selectedChat?.customer_id === conv.customer_id && "bg-secondary"
                      )}
                    >
                      <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-medium">
                          {getInitials(conv.customer_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-semibold text-sm truncate">
                            {conv.customer_name}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatConversationDate(conv.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground truncate flex-1">
                            {conv.last_message || 'Sem mensagem'}
                          </p>
                          {conv.customer_username && (
                            <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                              @{conv.customer_username}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredConversations?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma conversa encontrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className={cn(
            "glass-card lg:col-span-2 flex flex-col overflow-hidden",
            !selectedChat && "hidden lg:flex"
          )}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b py-3 px-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden shrink-0"
                      onClick={() => setSelectedChat(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10 ring-2 ring-background">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-medium">
                        {getInitials(selectedChat.customer_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{selectedChat.customer_name}</CardTitle>
                      {selectedChat.customer_username && (
                        <p className="text-xs text-muted-foreground">
                          @{selectedChat.customer_username}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {selectedChat.messages.length} mensagem{selectedChat.messages.length !== 1 && 's'}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="flex flex-col gap-1 p-4">
                      {selectedChat.messages.map((msg, index) => {
                        const prevMsg = selectedChat.messages[index - 1];
                        const showDateSeparator = !prevMsg || !isSameDay(new Date(msg.created_at), new Date(prevMsg.created_at));
                        
                        return (
                          <div key={msg.id}>
                            {showDateSeparator && (
                              <div className="flex items-center justify-center my-4">
                                <div className="bg-secondary/80 text-muted-foreground text-xs px-3 py-1 rounded-full">
                                  {formatDateSeparator(msg.created_at)}
                                </div>
                              </div>
                            )}
                            <MessageBubble message={msg} />
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center flex-1 py-12">
                <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">Selecione uma conversa</h3>
                <p className="text-muted-foreground text-sm text-center max-w-xs">
                  Escolha uma conversa da lista para visualizar as mensagens
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

function MessageBubble({ message }: { message: TelegramMessage }) {
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div className={cn("flex mb-1", isOutgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
          isOutgoing
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary/80 rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.message_content}
        </p>
        <div className={cn(
          "flex items-center justify-end gap-1 mt-1",
          isOutgoing ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          <span className="text-[10px]">
            {formatMessageTime(message.created_at)}
          </span>
          {isOutgoing && <CheckCheck className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
}
