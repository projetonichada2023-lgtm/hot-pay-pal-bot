import { useState, useEffect } from 'react';
import { Client } from '@/hooks/useClient';
import { useProducts, useUpdateProduct, Product } from '@/hooks/useProducts';
import { useFunnelStats } from '@/hooks/useFunnelStats';
import { supabase } from '@/integrations/supabase/client';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GitBranch, ArrowDown, ArrowRight, Loader2, Package, TrendingUp, TrendingDown, Plus, Trash2, DollarSign, Percent, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { SortableUpsellItem } from '@/components/funnel/SortableUpsellItem';

interface FunnelPageProps {
  client: Client;
}

type FunnelProduct = Product & {
  upsell_product_id?: string | null;
  downsell_product_id?: string | null;
  upsell_message?: string | null;
  downsell_message?: string | null;
};

interface ProductUpsell {
  id: string;
  product_id: string;
  upsell_product_id: string;
  upsell_message: string | null;
  display_order: number;
  is_active: boolean;
}

export const FunnelPage = ({ client }: FunnelPageProps) => {
  const { data: products, isLoading } = useProducts(client.id);
  const { data: stats } = useFunnelStats(client.id);
  const updateProduct = useUpdateProduct();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMainProduct, setSelectedMainProduct] = useState('');
  const [selectedUpsells, setSelectedUpsells] = useState<Array<{ productId: string; message: string }>>([]);
  const [selectedDownsell, setSelectedDownsell] = useState('');
  const [downsellMessage, setDownsellMessage] = useState('');
  
  // Store product upsells from the new table
  const [productUpsells, setProductUpsells] = useState<Record<string, ProductUpsell[]>>({});
  const [loadingUpsells, setLoadingUpsells] = useState(true);

  // DnD sensors
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

  // Fetch product upsells
  useEffect(() => {
    const fetchUpsells = async () => {
      if (!products?.length) return;
      
      setLoadingUpsells(true);
      const productIds = products.map(p => p.id);
      
      const { data, error } = await supabase
        .from('product_upsells')
        .select('*')
        .in('product_id', productIds)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching upsells:', error);
        setLoadingUpsells(false);
        return;
      }
      
      // Group by product_id
      const grouped: Record<string, ProductUpsell[]> = {};
      (data || []).forEach((upsell: ProductUpsell) => {
        if (!grouped[upsell.product_id]) {
          grouped[upsell.product_id] = [];
        }
        grouped[upsell.product_id].push(upsell);
      });
      
      setProductUpsells(grouped);
      setLoadingUpsells(false);
    };
    
    fetchUpsells();
  }, [products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getProductById = (id: string | null | undefined): FunnelProduct | undefined => {
    if (!id) return undefined;
    return products?.find(p => p.id === id) as FunnelProduct | undefined;
  };

  // Products with funnel configured (have upsells in new table OR legacy upsell_product_id)
  const funnelProducts = (products?.filter(p => {
    const hasNewUpsells = productUpsells[p.id]?.length > 0;
    const hasLegacyUpsell = (p as any).upsell_product_id;
    return hasNewUpsells || hasLegacyUpsell;
  }) || []) as FunnelProduct[];
  
  // Products without funnel (available to add)
  const availableProducts = (products?.filter(p => {
    const hasNewUpsells = productUpsells[p.id]?.length > 0;
    const hasLegacyUpsell = (p as any).upsell_product_id;
    return p.is_active && !hasNewUpsells && !hasLegacyUpsell;
  }) || []) as FunnelProduct[];

  const getOtherProducts = (excludeId?: string, excludeIds: string[] = []) => {
    return products?.filter(p => p.id !== excludeId && !excludeIds.includes(p.id) && p.is_active) || [];
  };

  const handleAddUpsellToList = () => {
    setSelectedUpsells([...selectedUpsells, { productId: '', message: '' }]);
  };

  const handleRemoveUpsellFromList = (index: number) => {
    setSelectedUpsells(selectedUpsells.filter((_, i) => i !== index));
  };

  const handleUpdateUpsellInList = (index: number, field: 'productId' | 'message', value: string) => {
    const updated = [...selectedUpsells];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedUpsells(updated);
  };

  const handleAddFunnel = async () => {
    if (!selectedMainProduct || selectedUpsells.length === 0 || !selectedUpsells[0].productId) {
      toast.error('Selecione o produto principal e pelo menos um upsell');
      return;
    }

    try {
      // Insert upsells into the new table
      const upsellsToInsert = selectedUpsells
        .filter(u => u.productId)
        .map((u, index) => ({
          product_id: selectedMainProduct,
          upsell_product_id: u.productId,
          upsell_message: u.message || null,
          display_order: index + 1,
        }));

      const { error: upsellError } = await supabase
        .from('product_upsells')
        .insert(upsellsToInsert);

      if (upsellError) throw upsellError;

      // Update downsell on the product if set
      if (selectedDownsell) {
        await updateProduct.mutateAsync({
          id: selectedMainProduct,
          clientId: client.id,
          downsell_product_id: selectedDownsell,
          downsell_message: downsellMessage || null,
        } as any);
      }

      // Refresh upsells
      const { data: newUpsells } = await supabase
        .from('product_upsells')
        .select('*')
        .eq('product_id', selectedMainProduct)
        .order('display_order', { ascending: true });

      setProductUpsells(prev => ({
        ...prev,
        [selectedMainProduct]: newUpsells || [],
      }));

      toast.success('Funil criado com sucesso!');
      setIsAddOpen(false);
      setSelectedMainProduct('');
      setSelectedUpsells([]);
      setSelectedDownsell('');
      setDownsellMessage('');
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast.error('Erro ao criar funil');
    }
  };

  const handleRemoveFunnel = async (product: FunnelProduct) => {
    try {
      // Delete all upsells from the new table
      await supabase
        .from('product_upsells')
        .delete()
        .eq('product_id', product.id);

      // Clear downsell and legacy upsell
      await updateProduct.mutateAsync({
        id: product.id,
        clientId: client.id,
        upsell_product_id: null,
        downsell_product_id: null,
        upsell_message: null,
        downsell_message: null,
      } as any);

      setProductUpsells(prev => {
        const updated = { ...prev };
        delete updated[product.id];
        return updated;
      });

      toast.success('Funil removido!');
    } catch (error) {
      toast.error('Erro ao remover funil');
    }
  };

  const handleAddUpsellToProduct = async (productId: string) => {
    const currentUpsells = productUpsells[productId] || [];
    const nextOrder = currentUpsells.length + 1;

    const { data, error } = await supabase
      .from('product_upsells')
      .insert({
        product_id: productId,
        upsell_product_id: products?.[0]?.id || '',
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao adicionar upsell');
      return;
    }

    setProductUpsells(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), data],
    }));

    toast.success('Upsell adicionado! Selecione o produto.');
  };

  const handleUpdateUpsell = async (upsellId: string, productId: string, updates: Partial<ProductUpsell>) => {
    const { error } = await supabase
      .from('product_upsells')
      .update(updates)
      .eq('id', upsellId);

    if (error) {
      toast.error('Erro ao atualizar upsell');
      return;
    }

    setProductUpsells(prev => ({
      ...prev,
      [productId]: prev[productId].map(u => 
        u.id === upsellId ? { ...u, ...updates } : u
      ),
    }));

    toast.success('Upsell atualizado!');
  };

  const handleDeleteUpsell = async (upsellId: string, productId: string) => {
    const { error } = await supabase
      .from('product_upsells')
      .delete()
      .eq('id', upsellId);

    if (error) {
      toast.error('Erro ao remover upsell');
      return;
    }

    setProductUpsells(prev => ({
      ...prev,
      [productId]: prev[productId].filter(u => u.id !== upsellId),
    }));

    toast.success('Upsell removido!');
  };

  const handleDragEnd = async (event: DragEndEvent, productId: string) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const upsells = productUpsells[productId] || [];
    const oldIndex = upsells.findIndex(u => u.id === active.id);
    const newIndex = upsells.findIndex(u => u.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(upsells, oldIndex, newIndex);
    
    // Update local state immediately for smooth UX
    setProductUpsells(prev => ({
      ...prev,
      [productId]: reordered,
    }));

    // Update display_order in database
    try {
      const updates = reordered.map((upsell, index) => 
        supabase
          .from('product_upsells')
          .update({ display_order: index + 1 })
          .eq('id', upsell.id)
      );

      await Promise.all(updates);
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Error reordering upsells:', error);
      toast.error('Erro ao reordenar');
      // Revert on error
      setProductUpsells(prev => ({
        ...prev,
        [productId]: upsells,
      }));
    }
  };

  const handleUpdateDownsell = async (product: FunnelProduct, downsellId: string) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        clientId: client.id,
        downsell_product_id: downsellId || null,
      } as any);
      toast.success('Downsell atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  const handleUpdateDownsellMessage = async (product: FunnelProduct, message: string) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        clientId: client.id,
        downsell_message: message || null,
      } as any);
      toast.success('Mensagem de downsell atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  if (isLoading || loadingUpsells) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" />
            Funil de Vendas
          </h1>
          <p className="text-muted-foreground">
            Configure múltiplos upsells e downsells para maximizar suas vendas
          </p>
        </div>
        <Button onClick={() => {
          setSelectedUpsells([{ productId: '', message: '' }]);
          setIsAddOpen(true);
        }} disabled={availableProducts.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Funil
        </Button>
      </div>

      {/* Statistics */}
      {stats && (stats.totalUpsellOffers > 0 || stats.totalDownsellOffers > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upsells Aceitos</p>
                  <p className="text-2xl font-bold">{stats.totalUpsellAccepted}/{stats.totalUpsellOffers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Percent className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Upsell</p>
                  <p className="text-2xl font-bold">{stats.totalUpsellRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Downsells Aceitos</p>
                  <p className="text-2xl font-bold">{stats.totalDownsellAccepted}/{stats.totalDownsellOffers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receita Adicional</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalAdditionalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Package className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Produto Principal</p>
                <p className="text-muted-foreground">O produto que o cliente compra</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Upsells</p>
                <p className="text-muted-foreground">Arraste para reordenar a sequência</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingDown className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Downsell</p>
                <p className="text-muted-foreground">Oferecido se recusar todos os upsells</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funnel List */}
      <div className="space-y-4">
        {funnelProducts.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum funil configurado ainda.</p>
              <p className="text-sm text-muted-foreground mb-4">Clique em "Adicionar Funil" para começar.</p>
              <Button onClick={() => {
                setSelectedUpsells([{ productId: '', message: '' }]);
                setIsAddOpen(true);
              }} disabled={availableProducts.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Funil
              </Button>
            </CardContent>
          </Card>
        ) : (
          funnelProducts.map((product) => {
            const upsells = productUpsells[product.id] || [];
            const downsellProduct = getProductById(product.downsell_product_id);
            const otherProducts = getOtherProducts(product.id, upsells.map(u => u.upsell_product_id));

            return (
              <Card key={product.id} className="glass-card overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {product.is_hot && <span>🔥</span>}
                          {product.name}
                        </CardTitle>
                        <CardDescription>{formatPrice(Number(product.price))}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveFunnel(product)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Main Product */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Produto Principal</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.name}</p>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Upsells with Drag and Drop */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Upsells</span>
                          <Badge variant="outline" className="text-xs">{upsells.length} configurado(s)</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddUpsellToProduct(product.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, product.id)}
                      >
                        <SortableContext
                          items={upsells.map(u => u.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {upsells.map((upsell, index) => (
                              <SortableUpsellItem
                                key={upsell.id}
                                upsell={upsell}
                                index={index}
                                productId={product.id}
                                getProductById={getProductById}
                                getOtherProducts={getOtherProducts}
                                allUpsells={upsells}
                                formatPrice={formatPrice}
                                onUpdate={handleUpdateUpsell}
                                onDelete={handleDeleteUpsell}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

                      {upsells.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Nenhum upsell configurado. Clique em "Adicionar" acima.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Downsell */}
                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">Downsell</span>
                        <Badge variant="outline" className="text-xs">Se recusar todos</Badge>
                      </div>
                      <div className="space-y-2">
                        <Select
                          value={product.downsell_product_id || 'none'}
                          onValueChange={(v) => handleUpdateDownsell(product, v === 'none' ? '' : v)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione o downsell..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {otherProducts.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.is_hot ? '🔥 ' : ''}{p.name} - {formatPrice(Number(p.price))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {product.downsell_product_id && (
                          <Textarea
                            placeholder="Mensagem personalizada do downsell..."
                            value={product.downsell_message || ''}
                            onChange={(e) => handleUpdateDownsellMessage(product, e.target.value)}
                            rows={2}
                            className="resize-none text-sm"
                          />
                        )}
                      </div>
                    </div>

                    {/* Flow visualization */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Fluxo do funil:</p>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
                        <span className="font-medium text-foreground">Cliente compra {product.name}</span>
                        {upsells.length > 0 && (
                          <>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-green-500">
                              Oferece {upsells.length} upsell{upsells.length > 1 ? 's' : ''} em sequência
                            </span>
                          </>
                        )}
                        {downsellProduct && (
                          <>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-orange-500">Se recusar: oferece {downsellProduct.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Tips */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">💡 Dicas para um bom funil</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Arraste para reordenar:</strong> Use o ícone de grip para reordenar os upsells</li>
            <li>• <strong>Ordem importa:</strong> O primeiro upsell é oferecido logo após a compra</li>
            <li>• <strong>Downsell:</strong> Oferecido apenas se o cliente recusar todos os upsells</li>
            <li>• <strong>Lembre-se:</strong> Ative o Upsell nas Configurações gerais para o funil funcionar</li>
          </ul>
        </CardContent>
      </Card>

      {/* Add Funnel Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Funil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto Principal *</Label>
              <Select value={selectedMainProduct} onValueChange={(v) => {
                setSelectedMainProduct(v);
                setSelectedUpsells([{ productId: '', message: '' }]);
                setSelectedDownsell('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.is_hot ? '🔥 ' : ''}{p.name} - {formatPrice(Number(p.price))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">O produto que o cliente vai comprar</p>
            </div>

            {/* Multiple Upsells */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Upsells *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddUpsellToList}
                  disabled={!selectedMainProduct}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Mais Upsell
                </Button>
              </div>

              {selectedUpsells.map((upsell, index) => (
                <div key={index} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-green-500">{index + 1}º Upsell</span>
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveUpsellFromList(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Select
                    value={upsell.productId}
                    onValueChange={(v) => handleUpdateUpsellInList(index, 'productId', v)}
                    disabled={!selectedMainProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o upsell..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getOtherProducts(
                        selectedMainProduct, 
                        selectedUpsells.filter((_, i) => i !== index).map(u => u.productId).filter(Boolean)
                      ).map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.is_hot ? '🔥 ' : ''}{p.name} - {formatPrice(Number(p.price))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Mensagem personalizada (opcional)..."
                    value={upsell.message}
                    onChange={(e) => handleUpdateUpsellInList(index, 'message', e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Upsells serão oferecidos na ordem configurada</p>
            </div>

            <div className="space-y-2">
              <Label>Downsell (opcional)</Label>
              <Select
                value={selectedDownsell || 'none'}
                onValueChange={(v) => setSelectedDownsell(v === 'none' ? '' : v)}
                disabled={!selectedMainProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o downsell..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {getOtherProducts(
                    selectedMainProduct, 
                    selectedUpsells.map(u => u.productId).filter(Boolean)
                  ).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.is_hot ? '🔥 ' : ''}{p.name} - {formatPrice(Number(p.price))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Oferecido se o cliente recusar todos os upsells</p>
            </div>

            {selectedDownsell && (
              <div className="space-y-2">
                <Label>Mensagem de Downsell (opcional)</Label>
                <Textarea
                  placeholder="💰 Última Oferta! Que tal este produto com um preço especial?"
                  value={downsellMessage}
                  onChange={(e) => setDownsellMessage(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddFunnel} 
              disabled={!selectedMainProduct || selectedUpsells.length === 0 || !selectedUpsells[0].productId}
            >
              Adicionar Funil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
