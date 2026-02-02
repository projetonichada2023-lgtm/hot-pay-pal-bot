import { ClientBot } from '@/hooks/useClientBots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, Trash2, Star, StarOff, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BotCardProps {
  bot: ClientBot;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetPrimary?: () => void;
}

export const BotCard = ({
  bot,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onSetPrimary,
}: BotCardProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              bot.is_active ? "gradient-hot glow-hot" : "bg-muted"
            )}>
              <Bot className={cn(
                "w-6 h-6",
                bot.is_active ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{bot.name}</CardTitle>
                {bot.is_primary && (
                  <Badge variant="default" className="text-xs">
                    Principal
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {bot.telegram_bot_username 
                  ? `@${bot.telegram_bot_username}` 
                  : 'Token não configurado'}
              </p>
            </div>
          </div>
          <Badge variant={bot.is_active ? "default" : "secondary"}>
            {bot.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            {bot.webhook_configured ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span>Webhook</span>
          </div>
          <div className="flex items-center gap-1">
            {bot.webhook_configured ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span>Configurado</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          
          {!bot.is_primary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSetPrimary}
              title="Definir como principal"
            >
              <Star className="w-4 h-4" />
            </Button>
          )}
          
          {!bot.is_primary && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              title="Excluir bot"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
