import { useState } from 'react';
import { BotMessage, MessageButton } from '@/hooks/useBotMessages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MessageCard } from './MessageCard';

interface MessageConfig {
  label: string;
  description: string;
  icon: string;
  allowMultiple: boolean;
}

interface MessageTypeSectionProps {
  messageType: string;
  config: MessageConfig;
  messages: BotMessage[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onAddMessage: () => void;
  onUpdateMessage: (id: string, updates: Partial<BotMessage>) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onMediaUpload: (file: File) => Promise<string | null>;
  isPending: boolean;
  isCreating: boolean;
}

export const MessageTypeSection = ({
  messageType,
  config,
  messages,
  isExpanded,
  onToggleExpanded,
  onAddMessage,
  onUpdateMessage,
  onDeleteMessage,
  onMoveUp,
  onMoveDown,
  onMediaUpload,
  isPending,
  isCreating,
}: MessageTypeSectionProps) => {
  const sortedMessages = [...messages].sort((a, b) => a.display_order - b.display_order);
  const activeCount = messages.filter(m => m.is_active).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
      <Card 
        className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-300 hover:border-border/60"
        id={`section-${messageType}`}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-2xl shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-shadow">
                  {config.icon}
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-3">
                    {config.label}
                    {messages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {messages.length} {messages.length === 1 ? 'mensagem' : 'mensagens'}
                        </Badge>
                        {activeCount < messages.length && (
                          <Badge variant="outline" className="font-normal text-muted-foreground">
                            {activeCount} ativas
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {config.description}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {config.allowMultiple && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddMessage();
                    }}
                    disabled={isCreating}
                    className="hidden sm:flex bg-secondary/50 hover:bg-secondary"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Nova Mensagem
                  </Button>
                )}
                <div className={`p-2 rounded-lg bg-secondary/50 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Mobile add button */}
            {config.allowMultiple && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAddMessage}
                disabled={isCreating}
                className="w-full sm:hidden"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Nova Mensagem
              </Button>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/50 mb-4">
                  <span className="text-3xl">{config.icon}</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Nenhuma mensagem configurada ainda.
                </p>
                {config.allowMultiple && (
                  <Button onClick={onAddMessage} disabled={isCreating}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Mensagem
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedMessages.map((message, index) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    index={index}
                    totalCount={sortedMessages.length}
                    onUpdate={onUpdateMessage}
                    onDelete={onDeleteMessage}
                    onMoveUp={() => onMoveUp(index)}
                    onMoveDown={() => onMoveDown(index)}
                    onMediaUpload={onMediaUpload}
                    isPending={isPending}
                    allowDelete={sortedMessages.length > 1}
                    showOrder={sortedMessages.length > 1}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
