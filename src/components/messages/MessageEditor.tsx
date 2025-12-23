import { useState, useRef } from 'react';
import { BotMessage, MessageButton } from '@/hooks/useBotMessages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Save, 
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Eye,
  Sparkles
} from 'lucide-react';
import { ButtonEditor } from './ButtonEditor';
import { TelegramPreview } from './TelegramPreview';
import { PlaceholderChips } from './PlaceholderChips';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageEditorProps {
  message: BotMessage;
  onSave: (updates: Partial<BotMessage>) => Promise<void>;
  onCancel: () => void;
  onMediaUpload: (file: File) => Promise<string | null>;
  isPending: boolean;
}

export const MessageEditor = ({
  message,
  onSave,
  onCancel,
  onMediaUpload,
  isPending,
}: MessageEditorProps) => {
  const [content, setContent] = useState(message.message_content);
  const [mediaUrl, setMediaUrl] = useState<string | null>(message.media_url);
  const [mediaType, setMediaType] = useState<string | null>(message.media_type);
  const [buttons, setButtons] = useState<MessageButton[]>(message.buttons || []);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    await onSave({
      message_content: content,
      media_url: mediaUrl,
      media_type: mediaType,
      buttons,
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const url = await onMediaUpload(file);
    if (url) {
      const isVideo = file.type.startsWith('video/');
      setMediaUrl(url);
      setMediaType(isVideo ? 'video' : 'image');
    }
    setUploading(false);
  };

  const handleRemoveMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + placeholder + content.substring(end);
      setContent(newContent);
      // Focus and set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    } else {
      setContent(prev => prev + placeholder);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with preview toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Editor de Mensagem</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          {showPreview ? 'Ocultar' : 'Mostrar'} Preview
        </Button>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor Column */}
        <div className="space-y-4">
          {/* Media Section */}
          <Card className="border-dashed">
            <CardContent className="p-4">
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

              {mediaUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-secondary/30">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} controls className="w-full max-h-40 object-contain" />
                    ) : (
                      <img src={mediaUrl} alt="" className="w-full max-h-40 object-contain" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {mediaType === 'video' ? <Video className="h-3 w-3 mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                        {mediaType === 'video' ? 'Vídeo' : 'Imagem'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex-1"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Trocar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveMedia}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-secondary/20 rounded-lg transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-2" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mb-3">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {uploading ? 'Enviando...' : 'Clique para adicionar foto ou vídeo'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    JPG, PNG, GIF ou MP4
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Text Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Texto da Mensagem</Label>
              <span className="text-xs text-muted-foreground">{content.length} caracteres</span>
            </div>
            
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] resize-none bg-secondary/30 border-border/50 font-mono text-sm"
              placeholder="Digite a mensagem que será enviada..."
            />
            
            <PlaceholderChips onInsert={insertPlaceholder} />
          </div>

          {/* Buttons Section */}
          <ButtonEditor buttons={buttons} onChange={setButtons} />

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={isPending || uploading} className="flex-1 sm:flex-none">
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>

        {/* Preview Column */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block"
            >
              <div className="sticky top-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <Label className="text-xs text-muted-foreground">Preview ao vivo</Label>
                </div>
                <TelegramPreview
                  content={content}
                  mediaUrl={mediaUrl}
                  mediaType={mediaType}
                  buttons={buttons}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
