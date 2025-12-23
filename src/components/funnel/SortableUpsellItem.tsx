import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product } from '@/hooks/useProducts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';

interface ProductUpsell {
  id: string;
  product_id: string;
  upsell_product_id: string;
  upsell_message: string | null;
  display_order: number;
  is_active: boolean;
}

interface SortableUpsellItemProps {
  upsell: ProductUpsell;
  index: number;
  productId: string;
  getProductById: (id: string | null | undefined) => Product | undefined;
  getOtherProducts: (excludeId?: string, excludeIds?: string[]) => Product[];
  allUpsells: ProductUpsell[];
  formatPrice: (price: number) => string;
  onUpdate: (upsellId: string, productId: string, updates: Partial<ProductUpsell>) => void;
  onDelete: (upsellId: string, productId: string) => void;
}

export function SortableUpsellItem({
  upsell,
  index,
  productId,
  getProductById,
  getOtherProducts,
  allUpsells,
  formatPrice,
  onUpdate,
  onDelete,
}: SortableUpsellItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: upsell.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const upsellProduct = getProductById(upsell.upsell_product_id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg bg-green-500/5 border border-green-500/20 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-1 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground transition-colors"
        >
          <GripVertical className="w-4 h-4" />
          <span className="text-xs font-medium">{index + 1}º</span>
        </div>
        <div className="flex-1 space-y-2">
          <Select
            value={upsell.upsell_product_id || 'none'}
            onValueChange={(v) => onUpdate(upsell.id, productId, {
              upsell_product_id: v === 'none' ? '' : v
            })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione o produto..." />
            </SelectTrigger>
            <SelectContent>
              {upsellProduct && (
                <SelectItem value={upsellProduct.id}>
                  {upsellProduct.is_hot ? '🔥 ' : ''}{upsellProduct.name} - {formatPrice(Number(upsellProduct.price))}
                </SelectItem>
              )}
              {getOtherProducts(productId, allUpsells.filter(u => u.id !== upsell.id).map(u => u.upsell_product_id)).map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.is_hot ? '🔥 ' : ''}{p.name} - {formatPrice(Number(p.price))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Mensagem personalizada do upsell..."
            value={upsell.upsell_message || ''}
            onChange={(e) => onUpdate(upsell.id, productId, {
              upsell_message: e.target.value || null
            })}
            rows={2}
            className="resize-none text-sm"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-8 w-8"
          onClick={() => onDelete(upsell.id, productId)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
