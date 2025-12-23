import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Clock, Edit2, Trash2, Image, Music, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartRecoveryMessage } from "@/hooks/useCartRecovery";

interface SortableRecoveryMessageProps {
  message: CartRecoveryMessage;
  index: number;
  products: { id: string; name: string; price: number }[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SortableRecoveryMessage({
  message,
  index,
  products,
  onEdit,
  onDelete,
}: SortableRecoveryMessageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: message.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const getTimeUnitLabel = (unit: string, value: number) => {
    if (unit === 'hours') return value === 1 ? 'hora' : 'horas';
    if (unit === 'days') return value === 1 ? 'dia' : 'dias';
    return 'min';
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={cn(
        "transition-all",
        !message.is_active && "opacity-50",
        isDragging && "shadow-lg ring-2 ring-primary/20"
      )}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="flex flex-col items-center gap-1 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground transition-colors pt-1"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                  Mensagem {index + 1}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {message.delay_minutes} {getTimeUnitLabel(message.time_unit || 'minutes', message.delay_minutes)}
                </span>
                {message.media_type && (
                  <span className="text-xs px-2 py-1 bg-muted rounded flex items-center gap-1">
                    {message.media_type === 'image' ? <Image className="w-3 h-3" /> : <Music className="w-3 h-3" />}
                    {message.media_type === 'image' ? 'Imagem' : 'Áudio'}
                  </span>
                )}
                {message.offer_product_id && (
                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Oferta: {products.find(p => p.id === message.offer_product_id)?.name || 'Produto'}
                  </span>
                )}
                {!message.is_active && (
                  <span className="text-xs text-muted-foreground">(Inativa)</span>
                )}
              </div>
              <div className="flex gap-3">
                {message.media_url && message.media_type === 'image' && (
                  <img src={message.media_url} alt="Preview" className="w-16 h-16 object-cover rounded shrink-0" />
                )}
                {message.media_url && message.media_type === 'audio' && (
                  <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center shrink-0">
                    <Music className="w-8 h-8 text-primary" />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap line-clamp-3 flex-1">
                  {message.message_content}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(message.id)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(message.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
