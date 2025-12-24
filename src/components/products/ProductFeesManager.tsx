import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Receipt, Edit2, X, Check, MessageSquare } from 'lucide-react';
import { useProductFees, useCreateProductFee, useUpdateProductFee, useDeleteProductFee, ProductFee } from '@/hooks/useProductFees';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  const [isAdding, setIsAdding] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [editingButtonText, setEditingButtonText] = useState('');

  const handleAddFee = async () => {
    if (!newFee.name.trim() || newFee.amount <= 0) {
      toast.error('Preencha o nome e um valor maior que zero');
      return;
    }

    try {
      await createFee.mutateAsync({
        product_id: productId,
        name: newFee.name.trim(),
        amount: newFee.amount,
        description: newFee.description.trim() || undefined,
        display_order: fees.length + 1,
      });
      setNewFee({ name: '', amount: 0, description: '', payment_message: '', button_text: '' });
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

  const handleStartEditMessage = (fee: ProductFee) => {
    setEditingFeeId(fee.id);
    setEditingMessage((fee as any).payment_message || DEFAULT_FEE_MESSAGE);
    setEditingButtonText((fee as any).button_text || 'Paguei a Taxa ✅');
  };

  const handleSaveMessage = async (feeId: string) => {
    try {
      await updateFee.mutateAsync({ 
        id: feeId, 
        payment_message: editingMessage.trim() || null,
        button_text: editingButtonText.trim() || null,
      } as any);
      setEditingFeeId(null);
      setEditingMessage('');
      setEditingButtonText('');
      toast.success('Mensagem atualizada');
    } catch (error) {
      toast.error('Erro ao salvar mensagem');
    }
  };

  const handleCancelEditMessage = () => {
    setEditingFeeId(null);
    setEditingMessage('');
    setEditingButtonText('');
  };

  const insertPlaceholder = (placeholder: string) => {
    setEditingMessage(prev => prev + placeholder);
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
          <div className="space-y-2">
            {fees.map((fee) => (
              <Collapsible key={fee.id}>
                <div
                  className={`rounded-md border ${
                    fee.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 p-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fee.name}</p>
                      {fee.description && (
                        <p className="text-xs text-muted-foreground truncate">{fee.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      R$ {Number(fee.amount).toFixed(2)}
                    </span>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Personalizar mensagem"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </CollapsibleTrigger>
                    <Switch
                      checked={fee.is_active}
                      onCheckedChange={() => handleToggleFeeActive(fee)}
                      className="scale-75"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteFee(fee)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="px-3 pb-3 pt-1 border-t space-y-2">
                      <Label className="text-xs font-medium">Mensagem de cobrança personalizada</Label>
                      
                        {editingFeeId === fee.id ? (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium mb-1 block">Texto do botão de confirmação</Label>
                            <Input
                              value={editingButtonText}
                              onChange={(e) => setEditingButtonText(e.target.value)}
                              placeholder="Paguei a Taxa ✅"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium mb-1 block">Mensagem de cobrança</Label>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {PLACEHOLDERS.map((p) => (
                                <Button
                                  key={p.key}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => insertPlaceholder(p.key)}
                                >
                                  {p.label}
                                </Button>
                              ))}
                            </div>
                            <Textarea
                              value={editingMessage}
                              onChange={(e) => setEditingMessage(e.target.value)}
                              placeholder="Mensagem personalizada para cobrança da taxa..."
                              className="min-h-[150px] text-sm font-mono"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEditMessage}
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveMessage(fee.id)}
                              disabled={updateFee.isPending}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Botão:</span> {(fee as any).button_text || 'Paguei a Taxa ✅'}
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-24 overflow-y-auto whitespace-pre-wrap font-mono">
                            {(fee as any).payment_message || '(Usando mensagem padrão)'}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEditMessage(fee)}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Personalizar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
            {fees.length > 0 && requireFeesBeforeDelivery && (
              <div className="flex justify-between pt-2 border-t text-sm">
                <span className="text-muted-foreground">Total de taxas ativas:</span>
                <span className="font-semibold">R$ {totalFees.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {isAdding ? (
          <div className="space-y-2 p-3 border rounded-md bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Nome da taxa</Label>
                <Input
                  value={newFee.name}
                  onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                  placeholder="Ex: Taxa de processamento"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newFee.amount || ''}
                  onChange={(e) => setNewFee({ ...newFee, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Descrição (opcional)</Label>
              <Input
                value={newFee.description}
                onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                placeholder="Breve descrição da taxa"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                setIsAdding(false);
                  setNewFee({ name: '', amount: 0, description: '', payment_message: '', button_text: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddFee}
                disabled={createFee.isPending}
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
