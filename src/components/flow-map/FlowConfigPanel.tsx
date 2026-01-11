import { BotMessage } from '@/hooks/useBotMessages';
import { CartRecoveryMessage } from '@/hooks/useCartRecovery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { 
  MessageSquare, 
  Settings2, 
  Check, 
  X,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowStep {
  id: string;
  label: string;
  icon: string;
  description: string;
  position: { x: number; y: number };
  category: string;
  optional?: boolean;
}

interface FlowConfigPanelProps {
  stepId: string;
  stepConfig: FlowStep;
  messages: BotMessage[];
  recoveryMessages?: CartRecoveryMessage[];
  onClose: () => void;
  onNavigateToMessages: () => void;
  onNavigateToRecovery: () => void;
}

export const FlowConfigPanel = ({
  stepId,
  stepConfig,
  messages,
  recoveryMessages,
  onClose,
  onNavigateToMessages,
  onNavigateToRecovery,
}: FlowConfigPanelProps) => {
  const isRecoveryStep = stepId === 'cart_reminder';
  const hasMessages = isRecoveryStep 
    ? (recoveryMessages && recoveryMessages.length > 0)
    : messages.length > 0;
  const activeCount = isRecoveryStep
    ? recoveryMessages?.filter(m => m.is_active).length || 0
    : messages.filter(m => m.is_active).length;

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{stepConfig.icon}</div>
            <div>
              <SheetTitle className="flex items-center gap-2">
                {stepConfig.label}
                {stepConfig.optional && (
                  <Badge variant="outline" className="text-xs">Opcional</Badge>
                )}
              </SheetTitle>
              <SheetDescription>{stepConfig.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Summary */}
          <div className="p-4 bg-secondary/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge 
                variant={hasMessages ? (activeCount > 0 ? 'default' : 'secondary') : 'outline'}
                className={cn(
                  hasMessages && activeCount > 0 && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                )}
              >
                {hasMessages 
                  ? (activeCount > 0 ? 'Configurado' : 'Inativo')
                  : 'Não configurado'
                }
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mensagens</span>
              <span className="font-medium">
                {isRecoveryStep ? recoveryMessages?.length || 0 : messages.length}
              </span>
            </div>
            {hasMessages && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ativas</span>
                <span className="font-medium text-emerald-500">{activeCount}</span>
              </div>
            )}
          </div>

          {/* Messages Preview */}
          {hasMessages && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Mensagens configuradas</h4>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {isRecoveryStep ? (
                    recoveryMessages?.map((msg) => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          msg.is_active 
                            ? "bg-secondary/50 border-border"
                            : "bg-secondary/20 border-border/50 opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground">
                                Após {msg.delay_minutes} {msg.time_unit === 'hours' ? 'horas' : 'minutos'}
                              </span>
                            </div>
                            <p className="text-sm line-clamp-2">{msg.message_content}</p>
                          </div>
                          {msg.is_active ? (
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          msg.is_active 
                            ? "bg-secondary/50 border-border"
                            : "bg-secondary/20 border-border/50 opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm line-clamp-2 flex-1">{msg.message_content}</p>
                          {msg.is_active ? (
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        {msg.buttons && msg.buttons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {msg.buttons.map((btn, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px]">
                                {btn.text}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Empty State */}
          {!hasMessages && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/50 mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Nenhuma mensagem configurada para esta etapa
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t">
            <Button 
              onClick={isRecoveryStep ? onNavigateToRecovery : onNavigateToMessages}
              className="w-full"
            >
              <Settings2 className="w-4 h-4 mr-2" />
              {hasMessages ? 'Editar Mensagens' : 'Configurar Mensagens'}
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
