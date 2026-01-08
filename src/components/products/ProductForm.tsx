import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Product } from '@/hooks/useProducts';
import { ProductFeesManager } from './ProductFeesManager';
import { PendingFeesManager, PendingFee } from './PendingFeesManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link, Users, Package } from 'lucide-react';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData, pendingFees?: PendingFee[]) => void;
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
  require_fees_before_delivery: boolean;
}

type DeliveryType = 'link' | 'group' | 'both' | 'none';

const getDeliveryType = (fileUrl: string, groupId: string): DeliveryType => {
  const hasLink = !!fileUrl?.trim();
  const hasGroup = !!groupId?.trim();
  if (hasLink && hasGroup) return 'both';
  if (hasLink) return 'link';
  if (hasGroup) return 'group';
  return 'none';
};

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
    require_fees_before_delivery: false,
  });
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('link');
  const [requireFees, setRequireFees] = useState(false);
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);

  useEffect(() => {
    if (product) {
      const requireFeesValue = (product as any).require_fees_before_delivery ?? false;
      const fileUrl = product.file_url || '';
      const groupId = (product as any).telegram_group_id || '';
      
      setFormData({
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        image_url: product.image_url || '',
        file_url: fileUrl,
        telegram_group_id: groupId,
        is_active: product.is_active ?? true,
        is_hot: product.is_hot ?? false,
        require_fees_before_delivery: requireFeesValue,
      });
      setDeliveryType(getDeliveryType(fileUrl, groupId));
      setRequireFees(requireFeesValue);
      setPendingFees([]);
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
        require_fees_before_delivery: false,
      });
      setDeliveryType('link');
      setRequireFees(false);
      setPendingFees([]);
    }
  }, [product, open]);

  const handleDeliveryTypeChange = (value: DeliveryType) => {
    setDeliveryType(value);
    // Clear fields based on selection
    if (value === 'link') {
      setFormData({ ...formData, telegram_group_id: '' });
    } else if (value === 'group') {
      setFormData({ ...formData, file_url: '' });
    } else if (value === 'none') {
      setFormData({ ...formData, file_url: '', telegram_group_id: '' });
    }
  };

  const handleRequireFeesChange = async (value: boolean) => {
    setRequireFees(value);
    setFormData({ ...formData, require_fees_before_delivery: value });
    
    // Update immediately in the database if editing
    if (product) {
      try {
        await supabase
          .from('products')
          .update({ require_fees_before_delivery: value })
          .eq('id', product.id);
      } catch (error) {
        toast.error('Erro ao atualizar configuração de taxas');
      }
    }
  };

  const handlePendingRequireFeesChange = (value: boolean) => {
    setRequireFees(value);
    setFormData({ ...formData, require_fees_before_delivery: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, product ? undefined : pendingFees);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="delivery">Entregável</TabsTrigger>
            <TabsTrigger value="fees">Taxas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-4">
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
          </TabsContent>

          <TabsContent value="delivery" className="mt-4 space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Entrega</Label>
              <RadioGroup value={deliveryType} onValueChange={(v) => handleDeliveryTypeChange(v as DeliveryType)} className="space-y-2">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="link" id="delivery-link" />
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="delivery-link" className="flex-1 cursor-pointer">
                    <span className="font-medium">Link do Produto</span>
                    <p className="text-xs text-muted-foreground">Entregar arquivo ou link direto</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="group" id="delivery-group" />
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="delivery-group" className="flex-1 cursor-pointer">
                    <span className="font-medium">Grupo VIP Telegram</span>
                    <p className="text-xs text-muted-foreground">Adicionar cliente a um grupo exclusivo</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="both" id="delivery-both" />
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="delivery-both" className="flex-1 cursor-pointer">
                    <span className="font-medium">Ambos</span>
                    <p className="text-xs text-muted-foreground">Link + Grupo VIP</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {(deliveryType === 'link' || deliveryType === 'both') && (
              <div className="space-y-1 animate-in fade-in duration-200">
                <Label htmlFor="file_url" className="text-sm">URL do Arquivo/Link</Label>
                <Input
                  id="file_url"
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://drive.google.com/... ou link do produto"
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">Link que será enviado ao cliente após a compra</p>
              </div>
            )}

            {(deliveryType === 'group' || deliveryType === 'both') && (
              <div className="space-y-1 animate-in fade-in duration-200">
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
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="button" 
                size="sm" 
                disabled={isLoading || !formData.name || formData.price <= 0}
                onClick={handleSubmit as any}
              >
                {isLoading ? 'Salvando...' : product ? 'Salvar' : 'Criar Produto'}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="fees" className="mt-4">
            {product ? (
              <>
                <ProductFeesManager
                  productId={product.id}
                  requireFeesBeforeDelivery={requireFees}
                  onRequireFeesChange={handleRequireFeesChange}
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Quando ativado, o cliente só receberá o produto após pagar todas as taxas obrigatórias configuradas acima.
                </p>
              </>
            ) : (
              <>
                <PendingFeesManager
                  fees={pendingFees}
                  onFeesChange={setPendingFees}
                  requireFeesBeforeDelivery={requireFees}
                  onRequireFeesChange={handlePendingRequireFeesChange}
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Quando ativado, o cliente só receberá o produto após pagar todas as taxas obrigatórias configuradas acima.
                </p>
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    disabled={isLoading || !formData.name || formData.price <= 0}
                    onClick={handleSubmit as any}
                  >
                    {isLoading ? 'Salvando...' : 'Criar Produto'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};