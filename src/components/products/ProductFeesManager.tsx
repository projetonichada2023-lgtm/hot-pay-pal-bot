import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Receipt } from 'lucide-react';
import { useProductFees, useCreateProductFee, useUpdateProductFee, useDeleteProductFee, ProductFee } from '@/hooks/useProductFees';
import { toast } from 'sonner';

interface ProductFeesManagerProps {
  productId: string;
  requireFeesBeforeDelivery: boolean;
  onRequireFeesChange: (value: boolean) => void;
}

export const ProductFeesManager = ({ 
  productId, 
  requireFeesBeforeDelivery, 
  onRequireFeesChange 
}: ProductFeesManagerProps) => {
  const { data: fees = [], isLoading } = useProductFees(productId);
  const createFee = useCreateProductFee();
  const updateFee = useUpdateProductFee();
  const deleteFee = useDeleteProductFee();

  const [newFee, setNewFee] = useState({ name: '', amount: 0 });
  const [isAdding, setIsAdding] = useState(false);

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
        display_order: fees.length + 1,
      });
      setNewFee({ name: '', amount: 0 });
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
              <div
                key={fee.id}
                className={`flex items-center gap-2 p-2 rounded-md border ${
                  fee.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fee.name}</p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  R$ {Number(fee.amount).toFixed(2)}
                </span>
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
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewFee({ name: '', amount: 0 });
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
