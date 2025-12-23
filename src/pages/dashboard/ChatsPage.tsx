import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { useTelegramConversations, ChatConversation, TelegramMessage } from '@/hooks/useTelegramMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, User, Send, ArrowLeft } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatsPageProps {
  client: Client;
}

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: ptBR });
  }
  if (isYesterday(date)) {
    return 'Ontem ' + format(date, 'HH:mm', { locale: ptBR });
  }
  return format(date, 'dd/MM HH:mm', { locale: ptBR });
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
      </div>

      {!hasConversations ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma conversa ainda</h3>
            <p className="text-muted-foreground text-center max-w-md">
              As conversas aparecerão aqui quando clientes interagirem com seu bot no Telegram.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Conversations List */}
          <Card className={cn("glass-card lg:col-span-1", selectedChat && "hidden lg:block")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversas ({conversations.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                <div className="space-y-1 px-2 pb-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.customer_id}
                      onClick={() => setSelectedChat(conv)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                        "hover:bg-secondary/80",
                        selectedChat?.customer_id === conv.customer_id && "bg-secondary"
                      )}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(conv.customer_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">
                            {conv.customer_name}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatMessageDate(conv.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.last_message || 'Sem mensagem'}
                          </p>
                          {conv.customer_username && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              @{conv.customer_username}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className={cn("glass-card lg:col-span-2", !selectedChat && "hidden lg:flex lg:items-center lg:justify-center")}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSelectedChat(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(selectedChat.customer_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{selectedChat.customer_name}</CardTitle>
                      {selectedChat.customer_username && (
                        <p className="text-xs text-muted-foreground">
                          @{selectedChat.customer_username}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0 flex-1">
                  <ScrollArea className="h-[calc(100vh-380px)] min-h-[350px]">
                    <div className="flex flex-col gap-2 p-4">
                      {selectedChat.messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma conversa para visualizar
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
    <div className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
          isOutgoing
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary rounded-bl-md"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.message_content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatMessageDate(message.created_at)}
        </p>
      </div>
    </div>
  );
}
