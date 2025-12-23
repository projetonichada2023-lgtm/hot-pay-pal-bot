import { MessageButton } from '@/hooks/useBotMessages';
import { ExternalLink, Bot } from 'lucide-react';

interface TelegramPreviewProps {
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  buttons?: MessageButton[];
  className?: string;
}

// Helper to process placeholders with example values
const processPlaceholders = (text: string): string => {
  return text
    .replace(/\{nome\}/g, 'João Silva')
    .replace(/\{primeiro_nome\}/g, 'João')
    .replace(/\{produto\}/g, 'Curso Premium')
    .replace(/\{valor\}/g, 'R$ 97,00')
    .replace(/\{pix_code\}/g, '00020126580014...')
    .replace(/\{pedido_id\}/g, '#12345');
};

export const TelegramPreview = ({ 
  content, 
  mediaUrl, 
  mediaType, 
  buttons = [],
  className = ''
}: TelegramPreviewProps) => {
  const processedContent = processPlaceholders(content);

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* iPhone-style frame */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-zinc-800 to-zinc-900 p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-zinc-900 rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div className="relative rounded-[2rem] overflow-hidden bg-[#17212b] min-h-[400px]">
          {/* Status bar */}
          <div className="h-10 bg-[#17212b] flex items-center justify-between px-6 pt-2">
            <span className="text-white/80 text-xs font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 rounded-sm bg-white/80" />
            </div>
          </div>
          
          {/* Chat header */}
          <div className="bg-[#232e3c] px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">Bot de Vendas</p>
              <p className="text-[#8e99a4] text-xs">online</p>
            </div>
          </div>
          
          {/* Chat area */}
          <div className="p-4 space-y-3">
            {/* Message bubble */}
            <div className="max-w-[85%]">
              {/* Media */}
              {mediaUrl && (
                <div className="rounded-t-2xl overflow-hidden mb-0.5">
                  {mediaType === 'video' ? (
                    <video 
                      src={mediaUrl} 
                      className="w-full h-32 object-cover" 
                      muted
                    />
                  ) : (
                    <img 
                      src={mediaUrl} 
                      alt="" 
                      className="w-full h-32 object-cover"
                    />
                  )}
                </div>
              )}
              
              {/* Text bubble */}
              <div className={`bg-[#182533] text-white/90 text-sm p-3 ${mediaUrl ? 'rounded-b-2xl rounded-tr-2xl' : 'rounded-2xl rounded-tl-md'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {processedContent || 'Sua mensagem aparecerá aqui...'}
                </p>
                <span className="text-[10px] text-[#6b7c8a] float-right mt-1 ml-2">
                  12:00
                </span>
              </div>
              
              {/* Inline buttons */}
              {buttons.length > 0 && (
                <div className="mt-1 space-y-1">
                  {buttons.map((btn, idx) => (
                    <button
                      key={idx}
                      className="w-full py-2.5 px-4 bg-[#3390ec] hover:bg-[#2b7bc9] text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {btn.type === 'url' && <ExternalLink className="h-3.5 w-3.5" />}
                      {btn.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Input bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#17212b] p-3 border-t border-[#232e3c]">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#242f3d] rounded-full px-4 py-2">
                <span className="text-[#6b7c8a] text-sm">Mensagem</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#3390ec] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        As variáveis serão substituídas automaticamente
      </p>
    </div>
  );
};
