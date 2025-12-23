import { useState, useRef } from 'react';
import { BotMessage, MessageButton } from '@/hooks/useBotMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Save, 
  Sparkles, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  X,
  Upload,
  GripVertical,
  Eye,
  EyeOff
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
import { ButtonEditor } from './ButtonEditor';
import { TelegramPreview } from './TelegramPreview';

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
  const [editContent, setEditContent] = useState(message.message_content);
  const [editMediaUrl, setEditMediaUrl] = useState<string | null>(message.media_url);
  const [editMediaType, setEditMediaType] = useState<string | null>(message.media_type);
  const [editButtons, setEditButtons] = useState<MessageButton[]>(message.buttons || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setEditContent(message.message_content);
    setEditMediaUrl(message.media_url);
    setEditMediaType(message.media_type);
    setEditButtons(message.buttons || []);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onUpdate(message.id, {
      message_content: editContent,
      media_url: editMediaUrl,
      media_type: editMediaType,
      buttons: editButtons,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(message.message_content);
    setEditMediaUrl(message.media_url);
    setEditMediaType(message.media_type);
    setEditButtons(message.buttons || []);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const url = await onMediaUpload(file);
    if (url) {
      const isVideo = file.type.startsWith('video/');
      setEditMediaUrl(url);
      setEditMediaType(isVideo ? 'video' : 'image');
    }
    setUploading(false);
  };

  const handleRemoveMedia = () => {
    setEditMediaUrl(null);
    setEditMediaType(null);
  };

  return (
    <Card className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:border-border/60 transition-all duration-300">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/30">
          {showOrder && (
            <div className="flex flex-col gap-0.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-50 hover:opacity-100"
                onClick={onMoveUp}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
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

          <div className="flex-1 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-lg">{index + 1}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Mensagem {index + 1}</span>
                {message.media_type && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    {message.media_type === 'video' ? (
                      <><Video className="h-2.5 w-2.5" /> Vídeo</>
                    ) : (
                      <><ImageIcon className="h-2.5 w-2.5" /> Foto</>
                    )}
                  </Badge>
                )}
                {(message.buttons?.length || 0) > 0 && (
                  <Badge variant="outline" className="text-[10px]">
                    {message.buttons?.length} botões
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1.5">
              <span className={`text-xs font-medium ${message.is_active ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {message.is_active ? 'Ativo' : 'Inativo'}
              </span>
              <Switch
                checked={message.is_active ?? false}
                onCheckedChange={(checked) => onUpdate(message.id, { is_active: checked })}
                className="scale-75"
              />
            </div>

            {allowDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
          {isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-4">
                {/* Media preview */}
                {editMediaUrl && (
                  <div className="relative rounded-xl overflow-hidden bg-secondary/30">
                    {editMediaType === 'video' ? (
                      <video src={editMediaUrl} controls className="w-full max-h-48 object-contain" />
                    ) : (
                      <img src={editMediaUrl} alt="" className="w-full max-h-48 object-contain" />
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={handleRemoveMedia}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Media upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full sm:w-auto"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {editMediaUrl ? 'Trocar Mídia' : 'Adicionar Foto/Vídeo'}
                  </Button>
                </div>

                {/* Text */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Texto da mensagem
                  </Label>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[120px] resize-none bg-secondary/30 border-border/50"
                    placeholder="Digite a mensagem..."
                  />
                </div>

                {/* Buttons */}
                <ButtonEditor buttons={editButtons} onChange={setEditButtons} />

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={isPending || uploading}>
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </div>

              {/* Preview */}
              <div className="hidden lg:block">
                <div className="sticky top-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground">Preview Telegram</Label>
                  </div>
                  <TelegramPreview
                    content={editContent}
                    mediaUrl={editMediaUrl}
                    mediaType={editMediaType}
                    buttons={editButtons}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Compact view with preview toggle */}
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {message.media_url && (
                    <div className="mb-3 rounded-xl overflow-hidden bg-secondary/30 max-w-xs">
                      {message.media_type === 'video' ? (
                        <video src={message.media_url} className="w-full h-24 object-cover" />
                      ) : (
                        <img src={message.media_url} alt="" className="w-full h-24 object-cover" />
                      )}
                    </div>
                  )}
                  <div className="p-3 bg-secondary/30 rounded-xl text-sm whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {message.message_content}
                  </div>
                </div>

                {/* Mini preview toggle */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 hidden md:flex"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <><EyeOff className="h-4 w-4 mr-2" /> Esconder</>
                  ) : (
                    <><Eye className="h-4 w-4 mr-2" /> Preview</>
                  )}
                </Button>
              </div>

              {/* Expanded preview */}
              {showPreview && (
                <div className="pt-4 border-t border-border/30">
                  <TelegramPreview
                    content={message.message_content}
                    mediaUrl={message.media_url}
                    mediaType={message.media_type}
                    buttons={message.buttons || []}
                    className="max-w-[280px]"
                  />
                </div>
              )}

              {/* Action button */}
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleStartEdit}
                className="mt-2"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Editar Mensagem
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
