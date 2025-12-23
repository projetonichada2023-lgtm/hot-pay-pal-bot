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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Curso de Marketing Digital"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva seu produto..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_url">URL do Arquivo (Entrega)</Label>
            <Input
              id="file_url"
              type="url"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              placeholder="https://exemplo.com/arquivo.pdf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram_group_id">ID do Grupo VIP (Telegram)</Label>
            <Input
              id="telegram_group_id"
              value={formData.telegram_group_id}
              onChange={(e) => setFormData({ ...formData, telegram_group_id: e.target.value })}
              placeholder="Ex: -1001234567890"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Como obter o ID do grupo:</strong></p>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>Adicione o bot <code className="bg-muted px-1 rounded">@userinfobot</code> ao seu grupo</li>
                <li>O bot enviará o ID do grupo (começa com <code className="bg-muted px-1 rounded">-100</code>)</li>
                <li>Remova o @userinfobot e adicione seu bot como admin com permissão de convidar</li>
              </ol>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Ativo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_hot"
                checked={formData.is_hot}
                onCheckedChange={(checked) => setFormData({ ...formData, is_hot: checked })}
              />
              <Label htmlFor="is_hot">🔥 Destaque</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : product ? 'Salvar' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
