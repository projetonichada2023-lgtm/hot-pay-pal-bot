import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Receipt, Edit2, X, Check, MessageSquare, Eye } from 'lucide-react';
import { useProductFees, useCreateProductFee, useUpdateProductFee, useDeleteProductFee, ProductFee } from '@/hooks/useProductFees';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductFeesManagerProps {
  productId: string;
  requireFeesBeforeDelivery: boolean;
  onRequireFeesChange: (value: boolean) => void;
}

const DEFAULT_FEE_MESSAGE = `💳 <b>Taxa Obrigatória</b>

Para receber seu produto, você precisa pagar a seguinte taxa:

<b>{fee_name}</b>
{fee_description}

💰 <b>Valor: R$ {fee_amount}</b>

📋 Taxas restantes: {remaining_count}`;

const PLACEHOLDERS = [
  { key: '{fee_name}', label: 'Nome da taxa' },
  { key: '{fee_amount}', label: 'Valor da taxa' },
  { key: '{fee_description}', label: 'Descrição da taxa' },
  { key: '{remaining_count}', label: 'Qtd taxas restantes' },
];

// Helper to convert HTML-like tags to styled spans for preview
const formatTelegramMessage = (text: string): string => {
  return text
    .replace(/<b>/g, '<strong>')
    .replace(/<\/b>/g, '</strong>')
    .replace(/<i>/g, '<em>')
    .replace(/<\/i>/g, '</em>')
    .replace(/<code>/g, '<code class="bg-muted px-1 rounded text-xs">')
    .replace(/\n/g, '<br/>');
};

// Preview component for Telegram-style message
const TelegramFeePreview = ({ 
  message, 
  buttonText, 
  feeName, 
  feeAmount, 
  feeDescription 
}: { 
  message: string; 
  buttonText: string; 
  feeName: string; 
  feeAmount: number; 
  feeDescription: string; 
}) => {
  const previewMessage = (message || DEFAULT_FEE_MESSAGE)
    .replace(/{fee_name}/g, feeName || 'Nome da Taxa')
    .replace(/{fee_amount}/g, feeAmount > 0 ? feeAmount.toFixed(2) : '0.00')
    .replace(/{fee_description}/g, feeDescription || '')
    .replace(/{remaining_count}/g, '1');

  const formattedMessage = formatTelegramMessage(previewMessage);
  const displayButtonText = buttonText || '💳 Gerar PIX para Pagar';

  return (
    <div className="rounded-lg border bg-[#0e1621] p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Eye className="h-3 w-3" />
        Preview no Telegram
      </div>
      <div className="bg-[#182533] rounded-lg p-3 text-white text-sm">
        <div 
          className="whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: formattedMessage }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <button className="w-full bg-[#2f6ea5] hover:bg-[#3a7db5] text-white text-sm py-2 px-4 rounded transition-colors">
          {displayButtonText}
        </button>
      </div>
    </div>
  );
};

// Sortable fee item component
interface FeeValidationErrors {
  name?: string;
  amount?: string;
}

const validateFeeData = (data: { name: string; amount: number }): FeeValidationErrors => {
  const errors: FeeValidationErrors = {};
  
  if (!data.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres';
  }
  
  if (data.amount <= 0) {
    errors.amount = 'Valor deve ser maior que zero';
  } else if (data.amount > 999999.99) {
    errors.amount = 'Valor máximo é R$ 999.999,99';
  }
  
  return errors;
};

interface SortableFeeItemProps {
  fee: ProductFee;
  editingFeeId: string | null;
  editingData: {
    name: string;
    amount: number;
    description: string;
    payment_message: string;
    button_text: string;
  };
  validationErrors: FeeValidationErrors;
  onToggleActive: (fee: ProductFee) => void;
  onDelete: (fee: ProductFee) => void;
  onStartEdit: (fee: ProductFee) => void;
  onSaveFee: (feeId: string) => void;
  onCancelEdit: () => void;
  onEditingDataChange: (data: Partial<SortableFeeItemProps['editingData']>) => void;
  onInsertPlaceholder: (placeholder: string) => void;
  isPending: boolean;
}

const SortableFeeItem = ({
  fee,
  editingFeeId,
  editingData,
  validationErrors,
  onToggleActive,
  onDelete,
  onStartEdit,
  onSaveFee,
  onCancelEdit,
  onEditingDataChange,
  onInsertPlaceholder,
  isPending,
}: SortableFeeItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fee.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
  };

  const isEditing = editingFeeId === fee.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border transition-all duration-200 ${
        fee.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
      } ${isDragging ? 'shadow-xl z-50 scale-[1.02] opacity-90 ring-2 ring-primary/20' : ''}`}
    >
      {isEditing ? (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Form fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nome da taxa</Label>
                  <Input
                    value={editingData.name}
                    onChange={(e) => onEditingDataChange({ name: e.target.value })}
                    placeholder="Ex: Taxa de processamento"
                    className={`h-8 text-sm ${validationErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-destructive">{validationErrors.name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingData.amount || ''}
                    onChange={(e) => onEditingDataChange({ amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className={`h-8 text-sm ${validationErrors.amount ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {validationErrors.amount && (
                    <p className="text-xs text-destructive">{validationErrors.amount}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs">Descrição (opcional)</Label>
                <Input
                  value={editingData.description}
                  onChange={(e) => onEditingDataChange({ description: e.target.value })}
                  placeholder="Breve descrição da taxa"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Texto do botão de gerar PIX (opcional)</Label>
                <Input
                  value={editingData.button_text}
                  onChange={(e) => onEditingDataChange({ button_text: e.target.value })}
                  placeholder="💳 Gerar PIX para Pagar"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Mensagem de cobrança (opcional)</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {PLACEHOLDERS.map((p) => (
                    <Button
                      key={p.key}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => onInsertPlaceholder(p.key)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={editingData.payment_message}
                  onChange={(e) => onEditingDataChange({ payment_message: e.target.value })}
                  placeholder="Deixe vazio para usar a mensagem padrão..."
                  className="min-h-[120px] text-sm font-mono"
                />
              </div>
            </div>
            
            {/* Preview */}
            <div className="lg:sticky lg:top-4">
              <TelegramFeePreview
                message={editingData.payment_message}
                buttonText={editingData.button_text}
                feeName={editingData.name}
                feeAmount={editingData.amount}
                feeDescription={editingData.description}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelEdit}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onSaveFee(fee.id)}
              disabled={isPending || Object.keys(validationErrors).length > 0}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fee.name}</p>
            {fee.description && (
              <p className="text-xs text-muted-foreground truncate">{fee.description}</p>
            )}
          </div>
          <span className="text-sm font-medium tabular-nums">
            R$ {Number(fee.amount).toFixed(2)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Editar taxa"
            onClick={() => onStartEdit(fee)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Switch
            checked={fee.is_active}
            onCheckedChange={() => onToggleActive(fee)}
            className="scale-75"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(fee)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const ProductFeesManager = ({ 
  productId, 
  requireFeesBeforeDelivery, 
  onRequireFeesChange 
}: ProductFeesManagerProps) => {
  const { data: fees = [], isLoading } = useProductFees(productId);
  const createFee = useCreateProductFee();
  const updateFee = useUpdateProductFee();
  const deleteFee = useDeleteProductFee();

  const [newFee, setNewFee] = useState({ name: '', amount: 0, description: '', payment_message: '', button_text: '' });
  const [newFeeErrors, setNewFeeErrors] = useState<FeeValidationErrors>({});
  const [isAdding, setIsAdding] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({ name: '', amount: 0, description: '', payment_message: '', button_text: '' });
  const [editingErrors, setEditingErrors] = useState<FeeValidationErrors>({});

  const handleNewFeeChange = (data: Partial<typeof newFee>) => {
    const updatedFee = { ...newFee, ...data };
    setNewFee(updatedFee);
    setNewFeeErrors(validateFeeData(updatedFee));
  };

  const handleAddFee = async () => {
    const errors = validateFeeData(newFee);
    setNewFeeErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await createFee.mutateAsync({
        product_id: productId,
        name: newFee.name.trim(),
        amount: newFee.amount,
        description: newFee.description.trim() || undefined,
        display_order: fees.length + 1,
        payment_message: newFee.payment_message.trim() || undefined,
        button_text: newFee.button_text.trim() || undefined,
      });
      setNewFee({ name: '', amount: 0, description: '', payment_message: '', button_text: '' });
      setNewFeeErrors({});
      setIsAdding(false);
      toast.success('Taxa adicionada');
    } catch (error) {
      toast.error('Erro ao adicionar taxa');
    }
  };

  const handleDeleteFee = async (fee: ProductFee) => {
    try {
      await deleteFee.mutateAsync({ id: fee.id, productId: fee.product_id });
      toast.success('Taxa removida');
    } catch (error) {
      toast.error('Erro ao remover taxa');
    }
  };

  const handleToggleFeeActive = async (fee: ProductFee) => {
    try {
      await updateFee.mutateAsync({ id: fee.id, is_active: !fee.is_active });
    } catch (error) {
      toast.error('Erro ao atualizar taxa');
    }
  };

  const handleStartEdit = (fee: ProductFee) => {
    setEditingFeeId(fee.id);
    const data = {
      name: fee.name,
      amount: Number(fee.amount),
      description: fee.description || '',
      payment_message: fee.payment_message || DEFAULT_FEE_MESSAGE,
      button_text: fee.button_text || '💳 Gerar PIX para Pagar',
    };
    setEditingData(data);
    setEditingErrors({});
  };

  const handleSaveFee = async (feeId: string) => {
    const errors = validateFeeData(editingData);
    setEditingErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      await updateFee.mutateAsync({ 
        id: feeId, 
        name: editingData.name.trim(),
        amount: editingData.amount,
        description: editingData.description.trim() || null,
        payment_message: editingData.payment_message.trim() || null,
        button_text: editingData.button_text.trim() || null,
      } as any);
      setEditingFeeId(null);
      setEditingData({ name: '', amount: 0, description: '', payment_message: '', button_text: '' });
      toast.success('Taxa atualizada');
    } catch (error) {
      toast.error('Erro ao salvar taxa');
    }
  };

  const handleCancelEdit = () => {
    setEditingFeeId(null);
    setEditingData({ name: '', amount: 0, description: '', payment_message: '', button_text: '' });
    setEditingErrors({});
  };

  const handleEditingDataChange = (data: Partial<typeof editingData>) => {
    const updatedData = { ...editingData, ...data };
    setEditingData(updatedData);
    setEditingErrors(validateFeeData(updatedData));
  };

  const insertPlaceholder = (placeholder: string, isNew = false) => {
    if (isNew) {
      setNewFee(prev => ({ ...prev, payment_message: prev.payment_message + placeholder }));
    } else {
      setEditingData(prev => ({ ...prev, payment_message: prev.payment_message + placeholder }));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fees.findIndex((fee) => fee.id === active.id);
      const newIndex = fees.findIndex((fee) => fee.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFees = arrayMove(fees, oldIndex, newIndex);
        
        // Update display_order for all affected fees
        try {
          await Promise.all(
            reorderedFees.map((fee, index) =>
              updateFee.mutateAsync({ id: fee.id, display_order: index + 1 })
            )
          );
        } catch (error) {
          toast.error('Erro ao reordenar taxas');
        }
      }
    }
  };

  const totalFees = fees.filter(f => f.is_active).reduce((sum, fee) => sum + Number(fee.amount), 0);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando taxas...</div>;
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Taxas Obrigatórias
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="require-fees" className="text-xs text-muted-foreground">
              Exigir antes da entrega
            </Label>
            <Switch
              id="require-fees"
              checked={requireFeesBeforeDelivery}
              onCheckedChange={onRequireFeesChange}
            />
          </div>
        </div>
        {requireFeesBeforeDelivery && (
          <p className="text-xs text-muted-foreground">
            O cliente precisará pagar todas as taxas ativas antes de receber o produto
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {fees.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fees.map((fee) => fee.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {fees.map((fee) => (
                  <SortableFeeItem
                    key={fee.id}
                    fee={fee}
                    editingFeeId={editingFeeId}
                    editingData={editingData}
                    validationErrors={editingErrors}
                    onToggleActive={handleToggleFeeActive}
                    onDelete={handleDeleteFee}
                    onStartEdit={handleStartEdit}
                    onSaveFee={handleSaveFee}
                    onCancelEdit={handleCancelEdit}
                    onEditingDataChange={handleEditingDataChange}
                    onInsertPlaceholder={(p) => insertPlaceholder(p)}
                    isPending={updateFee.isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        
        {fees.length > 0 && requireFeesBeforeDelivery && (
          <div className="flex justify-between pt-2 border-t text-sm">
            <span className="text-muted-foreground">Total de taxas ativas:</span>
            <span className="font-semibold">R$ {totalFees.toFixed(2)}</span>
          </div>
        )}

        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-md bg-muted/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Form fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome da taxa</Label>
                    <Input
                      value={newFee.name}
                      onChange={(e) => handleNewFeeChange({ name: e.target.value })}
                      placeholder="Ex: Taxa de processamento"
                      className={`h-8 text-sm ${newFeeErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {newFeeErrors.name && (
                      <p className="text-xs text-destructive">{newFeeErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newFee.amount || ''}
                      onChange={(e) => handleNewFeeChange({ amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className={`h-8 text-sm ${newFeeErrors.amount ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {newFeeErrors.amount && (
                      <p className="text-xs text-destructive">{newFeeErrors.amount}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Descrição (opcional)</Label>
                  <Input
                    value={newFee.description}
                    onChange={(e) => handleNewFeeChange({ description: e.target.value })}
                    placeholder="Breve descrição da taxa"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Texto do botão de gerar PIX (opcional)</Label>
                  <Input
                    value={newFee.button_text}
                    onChange={(e) => handleNewFeeChange({ button_text: e.target.value })}
                    placeholder="💳 Gerar PIX para Pagar"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Mensagem de cobrança (opcional)</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {PLACEHOLDERS.map((p) => (
                      <Button
                        key={p.key}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => insertPlaceholder(p.key, true)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                <Textarea
                    value={newFee.payment_message}
                    onChange={(e) => handleNewFeeChange({ payment_message: e.target.value })}
                    placeholder="Deixe vazio para usar a mensagem padrão..."
                    className="min-h-[120px] text-sm font-mono"
                  />
                </div>
              </div>
              
              {/* Preview */}
              <div className="lg:sticky lg:top-4">
                <TelegramFeePreview
                  message={newFee.payment_message}
                  buttonText={newFee.button_text}
                  feeName={newFee.name}
                  feeAmount={newFee.amount}
                  feeDescription={newFee.description}
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewFee({ name: '', amount: 0, description: '', payment_message: '', button_text: '' });
                  setNewFeeErrors({});
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddFee}
                disabled={createFee.isPending || Object.keys(newFeeErrors).length > 0}
              >
                {createFee.isPending ? 'Salvando...' : 'Adicionar'}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Taxa
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
