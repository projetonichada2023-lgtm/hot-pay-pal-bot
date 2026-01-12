import { useBotContext } from '@/contexts/BotContext';
import { ClientBot } from '@/hooks/useClientBots';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bot, Check, ChevronDown, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BotSelectorProps {
  isCollapsed?: boolean;
}

export const BotSelector = ({ isCollapsed = false }: BotSelectorProps) => {
  const { selectedBot, setSelectedBot, bots, isLoading } = useBotContext();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-2 py-4 mb-4",
        isCollapsed && "justify-center px-0"
      )}>
        <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        {!isCollapsed && (
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-24" />
            <div className="h-3 bg-muted rounded animate-pulse w-16" />
          </div>
        )}
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full h-auto py-3 mb-4",
          isCollapsed ? "px-2" : "px-3"
        )}
        onClick={() => navigate('/dashboard/bots')}
      >
        <Plus className="w-5 h-5" />
        {!isCollapsed && <span className="ml-2">Configurar Bot</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full h-auto py-3 mb-4 hover:bg-sidebar-accent",
            isCollapsed ? "px-2 justify-center" : "px-3 justify-start"
          )}
        >
          <div className="w-10 h-10 rounded-xl gradient-hot flex items-center justify-center glow-hot shrink-0">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 text-left ml-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-foreground truncate text-sm">
                    {selectedBot?.name || 'Selecionar Bot'}
                  </h2>
                  {selectedBot?.is_primary && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      Principal
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedBot?.telegram_bot_username 
                    ? `@${selectedBot.telegram_bot_username}` 
                    : 'Não configurado'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Seus Bots</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {bots.map((bot) => (
          <DropdownMenuItem
            key={bot.id}
            onClick={() => setSelectedBot(bot)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                bot.is_active ? "bg-primary/10" : "bg-muted"
              )}>
                <Bot className={cn(
                  "w-4 h-4",
                  bot.is_active ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{bot.name}</span>
                  {bot.is_primary && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      Principal
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate block">
                  {bot.telegram_bot_username ? `@${bot.telegram_bot_username}` : 'Não configurado'}
                </span>
              </div>
              {selectedBot?.id === bot.id && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/dashboard/bots')}
          className="cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-2" />
          Gerenciar Bots
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/dashboard/bots?action=add')}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bot
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
