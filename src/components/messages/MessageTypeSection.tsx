import { useState } from 'react';
import { BotMessage, MessageButton } from '@/hooks/useBotMessages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, GripVertical } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MessageTemplates } from './MessageTemplates';
import { SortableMessageCard } from './SortableMessageCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
  onAddMessageWithContent: (content: string, buttons?: MessageButton[]) => void;
  onUpdateMessage: (id: string, updates: Partial<BotMessage>) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  onReorderMessages: (updates: { id: string; display_order: number }[]) => Promise<void>;
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
  onAddMessageWithContent,
  onUpdateMessage,
  onDeleteMessage,
  onReorderMessages,
  onMediaUpload,
  isPending,
  isCreating,
}: MessageTypeSectionProps) => {
  const sortedMessages = [...messages].sort((a, b) => a.display_order - b.display_order);
  const activeCount = messages.filter(m => m.is_active).length;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedMessages.findIndex((m) => m.id === active.id);
      const newIndex = sortedMessages.findIndex((m) => m.id === over.id);

      const newOrder = arrayMove(sortedMessages, oldIndex, newIndex);
      const updates = newOrder.map((m, i) => ({ id: m.id, display_order: i + 1 }));
      
      await onReorderMessages(updates);
    }
  };

  const handleTemplateSelect = (content: string, buttons?: Array<{ text: string; type: 'callback' | 'url'; value: string }>) => {
    onAddMessageWithContent(content, buttons as MessageButton[]);
  };

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

            {messages.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/50 mb-4">
                  <span className="text-3xl">{config.icon}</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Nenhuma mensagem configurada ainda.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <MessageTemplates 
                    messageType={messageType} 
                    onSelectTemplate={handleTemplateSelect} 
                  />
                  <Button variant="outline" onClick={onAddMessage} disabled={isCreating}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar do Zero
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pl-0 sm:pl-8">
                {sortedMessages.length > 1 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-2 pb-2">
                    <GripVertical className="h-3 w-3" />
                    Arraste para reordenar as mensagens
                  </p>
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedMessages.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedMessages.map((message, index) => (
                      <SortableMessageCard
                        key={message.id}
                        message={message}
                        index={index}
                        totalCount={sortedMessages.length}
                        onUpdate={onUpdateMessage}
                        onDelete={onDeleteMessage}
                        onMediaUpload={onMediaUpload}
                        isPending={isPending}
                        allowDelete={true}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {/* Add more button */}
                <div className="pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <MessageTemplates 
                      messageType={messageType} 
                      onSelectTemplate={handleTemplateSelect} 
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={onAddMessage} 
                      disabled={isCreating}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Mensagem em branco
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
