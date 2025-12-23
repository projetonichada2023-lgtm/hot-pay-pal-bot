import { Music } from 'lucide-react';

interface RecoveryTelegramPreviewProps {
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  offerProduct?: { name: string; price: number; image_url?: string | null } | null;
  offerMessage?: string | null;
  className?: string;
}

export const RecoveryTelegramPreview = ({ 
  content, 
  mediaUrl, 
  mediaType, 
  offerProduct,
  offerMessage,
  className = ''
}: RecoveryTelegramPreviewProps) => {
  // Replace placeholders with example values
  const previewContent = content
    .replace("{nome}", "João")
    .replace("{produto}", "Curso Premium")
    .replace("{valor}", "R$ 97,00");

  return (
    <div className={`w-full max-w-[280px] sm:max-w-xs mx-auto ${className}`}>
      {/* iPhone-style frame */}
      <div className="relative rounded-[2rem] bg-gradient-to-b from-zinc-800 to-zinc-900 p-2 shadow-xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-b-xl z-10" />
        
        {/* Screen */}
        <div className="relative rounded-[1.5rem] overflow-hidden bg-[#17212b] min-h-[350px]">
          {/* Status bar */}
          <div className="h-8 bg-[#17212b] flex items-center justify-between px-5 pt-1">
            <span className="text-white/80 text-[10px] font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded-sm bg-white/80" />
            </div>
          </div>
          
          {/* Chat header */}
          <div className="bg-[#232e3c] px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-semibold">Bot de Vendas</p>
              <p className="text-[#8e99a4] text-[10px]">online</p>
            </div>
          </div>
          
          {/* Chat area */}
          <div className="p-3 space-y-2 pb-14">
            {/* Main recovery message */}
            <div className="max-w-[90%]">
              {/* Media */}
              {mediaUrl && mediaType === 'image' && (
                <div className="rounded-t-xl overflow-hidden mb-0.5">
                  <img 
                    src={mediaUrl} 
                    alt="" 
                    className="w-full h-24 object-cover"
                  />
                </div>
              )}
              
              {/* Audio indicator */}
              {mediaUrl && mediaType === 'audio' && (
                <div className="bg-[#182533] rounded-t-xl p-2 mb-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Music className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-1 bg-primary/30 rounded-full">
                        <div className="h-1 bg-primary rounded-full w-1/3" />
                      </div>
                      <p className="text-[9px] text-[#6b7c8a] mt-0.5">0:15 / 0:45</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Text bubble */}
              <div className={`bg-[#182533] text-white/90 text-[11px] p-2.5 ${mediaUrl ? 'rounded-b-xl rounded-tr-xl' : 'rounded-xl rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {previewContent || 'Sua mensagem aparecerá aqui...'}
                </p>
                <span className="text-[8px] text-[#6b7c8a] float-right mt-1 ml-2">
                  12:00
                </span>
              </div>
            </div>

            {/* Offer product message */}
            {offerProduct && (
              <div className="max-w-[90%]">
                {offerProduct.image_url && (
                  <div className="rounded-t-xl overflow-hidden mb-0.5">
                    <img 
                      src={offerProduct.image_url} 
                      alt="" 
                      className="w-full h-20 object-cover"
                    />
                  </div>
                )}
                <div className={`bg-[#182533] text-white/90 text-[11px] p-2.5 ${offerProduct.image_url ? 'rounded-b-xl rounded-tr-xl' : 'rounded-xl rounded-tl-sm'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {offerMessage || "🔥 Aproveite também esta oferta especial:"}
                    {"\n\n"}📦 <strong>{offerProduct.name}</strong>{"\n"}💰 R$ {offerProduct.price.toFixed(2).replace(".", ",")}
                  </p>
                  <span className="text-[8px] text-[#6b7c8a] float-right mt-1 ml-2">
                    12:00
                  </span>
                </div>
                {/* Buy button */}
                <button className="w-full mt-1 py-1.5 px-3 bg-[#3390ec] text-white text-[10px] font-medium rounded-lg">
                  🛒 Comprar agora
                </button>
              </div>
            )}
          </div>
          
          {/* Input bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#17212b] p-2 border-t border-[#232e3c]">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#242f3d] rounded-full px-3 py-1.5">
                <span className="text-[#6b7c8a] text-[10px]">Mensagem</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#3390ec] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Preview do Telegram
      </p>
    </div>
  );
};
