import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Product } from '@/hooks/useProducts';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => void;
  product?: Product | null;
  isLoading?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image_url: string;
  file_url: string;
  telegram_group_id: string;
  is_active: boolean;
  is_hot: boolean;
}

export const ProductForm = ({ open, onOpenChange, onSubmit, product, isLoading }: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    file_url: '',
    telegram_group_id: '',
    is_active: true,
    is_hot: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        image_url: product.image_url || '',
        file_url: product.file_url || '',
        telegram_group_id: (product as any).telegram_group_id || '',
        is_active: product.is_active ?? true,
        is_hot: product.is_hot ?? false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        file_url: '',
        telegram_group_id: '',
        is_active: true,
        is_hot: false,
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Curso de Marketing"
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price" className="text-sm">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva seu produto..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="image_url" className="text-sm">URL da Imagem</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="file_url" className="text-sm">URL do Arquivo</Label>
              <Input
                id="file_url"
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder="https://..."
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="telegram_group_id" className="text-sm">ID do Grupo VIP (Telegram)</Label>
            <Input
              id="telegram_group_id"
              value={formData.telegram_group_id}
              onChange={(e) => setFormData({ ...formData, telegram_group_id: e.target.value })}
              placeholder="Ex: -1001234567890"
              className="h-9"
            />
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">Como obter o ID do grupo?</summary>
              <ol className="list-decimal list-inside space-y-0.5 ml-1 mt-1">
                <li>Busque por <code className="bg-muted px-1 rounded">@ScanIDBot</code> no Telegram</li>
                <li>Envie <code className="bg-muted px-1 rounded">/start</code> no chat privado</li>
                <li>Selecione <strong>"Group"</strong> e escolha o grupo</li>
                <li>O ID começa com <code className="bg-muted px-1 rounded">-100</code></li>
                <li>Adicione seu bot como admin do grupo</li>
              </ol>
            </details>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="text-sm">Ativo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_hot"
                checked={formData.is_hot}
                onCheckedChange={(checked) => setFormData({ ...formData, is_hot: checked })}
              />
              <Label htmlFor="is_hot" className="text-sm">🔥 Destaque</Label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Salvando...' : product ? 'Salvar' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
