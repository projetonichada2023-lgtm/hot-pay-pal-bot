import { useState } from 'react';
import { BotMessage, MessageButton } from '@/hooks/useBotMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  GripVertical,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  MousePointer2,
  Sparkles
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TelegramPreview } from './TelegramPreview';
import { MessageEditor } from './MessageEditor';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageCardProps {
  message: BotMessage;
  index: number;
  totalCount: number;
  onUpdate: (id: string, updates: Partial<BotMessage>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMediaUpload: (file: File) => Promise<string | null>;
  isPending: boolean;
  allowDelete: boolean;
  showOrder: boolean;
}

export const MessageCard = ({
  message,
  index,
  totalCount,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMediaUpload,
  isPending,
  allowDelete,
  showOrder,
}: MessageCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async (updates: Partial<BotMessage>) => {
    await onUpdate(message.id, updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Highlight placeholders in content
  const highlightContent = (text: string) => {
    const parts = text.split(/(\{[^}]+\})/g);
    return parts.map((part, i) => {
      if (part.match(/^\{[^}]+\}$/)) {
        return (
          <span key={i} className="bg-primary/20 text-primary px-1 rounded text-xs font-mono">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className={`group overflow-hidden border-border/40 backdrop-blur-sm transition-all duration-300 hover:border-border/60 ${
        message.is_active 
          ? 'bg-card/50' 
          : 'bg-card/30 opacity-75'
      }`}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-border/30">
            {/* Reorder controls */}
            {showOrder && (
              <div className="hidden sm:flex flex-col gap-0.5 -my-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-50 hover:opacity-100"
                  onClick={onMoveUp}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <GripVertical className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-50 hover:opacity-100"
                  onClick={onMoveDown}
                  disabled={index === totalCount - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Message info */}
            <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center font-semibold text-sm ${
                message.is_active 
                  ? 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary' 
                  : 'bg-secondary text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-sm font-medium">Mensagem {index + 1}</span>
                  <div className="flex items-center gap-1.5">
                    {message.media_type && (
                      <Badge variant="secondary" className="text-[10px] gap-1 h-5">
                        {message.media_type === 'video' ? (
                          <Video className="h-2.5 w-2.5" />
                        ) : (
                          <ImageIcon className="h-2.5 w-2.5" />
                        )}
                        <span className="hidden sm:inline">
                          {message.media_type === 'video' ? 'Vídeo' : 'Imagem'}
                        </span>
                      </Badge>
                    )}
                    {(message.buttons?.length || 0) > 0 && (
                      <Badge variant="outline" className="text-[10px] gap-1 h-5">
                        <MousePointer2 className="h-2.5 w-2.5" />
                        {message.buttons?.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Status toggle */}
              <div className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 transition-colors ${
                message.is_active 
                  ? 'bg-success/10' 
                  : 'bg-secondary/50'
              }`}>
                <span className={`text-[10px] sm:text-xs font-medium hidden sm:inline ${
                  message.is_active ? 'text-success' : 'text-muted-foreground'
                }`}>
                  {message.is_active ? 'Ativo' : 'Inativo'}
                </span>
                <Switch
                  checked={message.is_active ?? false}
                  onCheckedChange={(checked) => onUpdate(message.id, { is_active: checked })}
                  className="scale-[0.7]"
                />
              </div>

              {/* Mobile menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 sm:hidden">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
                  </DropdownMenuItem>
                  {showOrder && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onMoveUp} disabled={index === 0}>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Mover para cima
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onMoveDown} disabled={index === totalCount - 1}>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Mover para baixo
                      </DropdownMenuItem>
                    </>
                  )}
                  {allowDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(message.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Desktop buttons */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPreview(!showPreview)}
                className="hidden sm:flex h-8 text-xs"
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                Preview
              </Button>

              {allowDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover mensagem?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(message.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MessageEditor
                    message={message}
                    messageType={message.message_type}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onMediaUpload={onMediaUpload}
                    isPending={isPending}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Content preview */}
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Media thumbnail */}
                      {message.media_url && (
                        <div className="mb-3 rounded-xl overflow-hidden bg-secondary/30 max-w-[200px]">
                          {message.media_type === 'video' ? (
                            <video src={message.media_url} className="w-full h-20 object-cover" />
                          ) : (
                            <img src={message.media_url} alt="" className="w-full h-20 object-cover" />
                          )}
                        </div>
                      )}
                      
                      {/* Text content with highlighted placeholders */}
                      <div className="p-3 bg-secondary/30 rounded-xl text-sm whitespace-pre-wrap leading-relaxed line-clamp-4">
                        {highlightContent(message.message_content)}
                      </div>

                      {/* Button badges */}
                      {message.buttons && message.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.buttons.map((btn, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              {btn.text}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline preview */}
                  <AnimatePresence>
                    {showPreview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-4 border-t border-border/30 overflow-hidden"
                      >
                        <TelegramPreview
                          content={message.message_content}
                          mediaUrl={message.media_url}
                          mediaType={message.media_type}
                          buttons={message.buttons || []}
                          className="max-w-[280px]"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Edit button */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="mt-2"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Editar Mensagem
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
