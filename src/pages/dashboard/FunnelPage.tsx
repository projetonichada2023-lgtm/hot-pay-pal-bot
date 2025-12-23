import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { useProducts, useUpdateProduct, Product } from '@/hooks/useProducts';
import { useFunnelStats } from '@/hooks/useFunnelStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GitBranch, ArrowDown, ArrowRight, Loader2, Package, TrendingUp, TrendingDown, Plus, Trash2, BarChart3, DollarSign, Percent } from 'lucide-react';
import { toast } from 'sonner';

interface FunnelPageProps {
  client: Client;
}

type FunnelProduct = Product & {
  upsell_product_id?: string | null;
  downsell_product_id?: string | null;
};

export const FunnelPage = ({ client }: FunnelPageProps) => {
  const { data: products, isLoading } = useProducts(client.id);
  const { data: stats } = useFunnelStats(client.id);
  const updateProduct = useUpdateProduct();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMainProduct, setSelectedMainProduct] = useState('');
  const [selectedUpsell, setSelectedUpsell] = useState('');
  const [selectedDownsell, setSelectedDownsell] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getProductById = (id: string | null | undefined): FunnelProduct | undefined => {
    if (!id) return undefined;
    return products?.find(p => p.id === id) as FunnelProduct | undefined;
  };

  // Products with funnel configured (have upsell)
  const funnelProducts = (products?.filter(p => (p as any).upsell_product_id) || []) as FunnelProduct[];
  
  // Products without funnel (available to add)
  const availableProducts = (products?.filter(p => p.is_active && !(p as any).upsell_product_id) || []) as FunnelProduct[];

  const getOtherProducts = (excludeId?: string) => {
    return products?.filter(p => p.id !== excludeId && p.is_active) || [];
  };

  const handleAddFunnel = async () => {
    if (!selectedMainProduct || !selectedUpsell) {
      toast.error('Selecione o produto principal e o upsell');
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: selectedMainProduct,
        clientId: client.id,
        upsell_product_id: selectedUpsell,
        downsell_product_id: selectedDownsell || null,
      } as any);
      toast.success('Funil criado com sucesso!');
      setIsAddOpen(false);
      setSelectedMainProduct('');
      setSelectedUpsell('');
      setSelectedDownsell('');
    } catch (error) {
      toast.error('Erro ao criar funil');
    }
  };

  const handleRemoveFunnel = async (product: FunnelProduct) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        clientId: client.id,
        upsell_product_id: null,
        downsell_product_id: null,
      } as any);
      toast.success('Funil removido!');
    } catch (error) {
      toast.error('Erro ao remover funil');
    }
  };

  const handleUpdateUpsell = async (product: FunnelProduct, upsellId: string) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        clientId: client.id,
        upsell_product_id: upsellId || null,
      } as any);
      toast.success('Upsell atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar');
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

  if (isLoading) {
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
            Configure upsells e downsells para maximizar suas vendas
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} disabled={availableProducts.length === 0}>
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
                <p className="font-medium">Upsell</p>
                <p className="text-muted-foreground">Oferecido após a compra confirmada</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingDown className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Downsell</p>
                <p className="text-muted-foreground">Oferecido se recusar o upsell</p>
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
              <Button onClick={() => setIsAddOpen(true)} disabled={availableProducts.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Funil
              </Button>
            </CardContent>
          </Card>
        ) : (
          funnelProducts.map((product) => {
            const upsellProduct = getProductById(product.upsell_product_id);
            const downsellProduct = getProductById(product.downsell_product_id);
            const otherProducts = getOtherProducts(product.id);

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
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                    {/* Main Product Visual */}
                    <div className="flex-1 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Produto Principal</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{product.name}</p>
                    </div>

                    <ArrowRight className="w-5 h-5 text-muted-foreground hidden lg:block" />
                    <ArrowDown className="w-5 h-5 text-muted-foreground mx-auto lg:hidden" />

                    {/* Upsell */}
                    <div className="flex-1 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Upsell</span>
                        <Badge variant="outline" className="text-xs">Após compra</Badge>
                      </div>
                      <Select 
                        value={product.upsell_product_id || ''} 
                        onValueChange={(v) => handleUpdateUpsell(product, v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {otherProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.is_hot ? '🔥 ' : ''}{p.name} - {formatPrice(Number(p.price))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <ArrowRight className="w-5 h-5 text-muted-foreground hidden lg:block" />
                    <ArrowDown className="w-5 h-5 text-muted-foreground mx-auto lg:hidden" />

                    {/* Downsell */}
                    <div className="flex-1 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">Downsell</span>
                        <Badge variant="outline" className="text-xs">Se recusar</Badge>
                      </div>
                      <Select 
                        value={product.downsell_product_id || 'none'} 
                        onValueChange={(v) => handleUpdateDownsell(product, v === 'none' ? '' : v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione..." />
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
                    </div>
                  </div>

                  {/* Flow visualization */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Fluxo do funil:</p>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
                      <span className="font-medium text-foreground">Cliente compra {product.name}</span>
                      {upsellProduct && (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-green-500">Oferece {upsellProduct.name}</span>
                          {downsellProduct && (
                            <>
                              <ArrowRight className="w-3 h-3" />
                              <span className="text-orange-500">Se recusar: oferece {downsellProduct.name}</span>
                            </>
                          )}
                        </>
                      )}
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
            <li>• <strong>Upsell:</strong> Ofereça um produto complementar ou versão premium com valor maior</li>
            <li>• <strong>Downsell:</strong> Ofereça algo mais acessível se o cliente recusar o upsell</li>
            <li>• <strong>Lembre-se:</strong> Ative o Upsell nas Configurações gerais para o funil funcionar</li>
          </ul>
        </CardContent>
      </Card>

      {/* Add Funnel Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Adicionar Funil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto Principal *</Label>
              <Select value={selectedMainProduct} onValueChange={(v) => {
                setSelectedMainProduct(v);
                setSelectedUpsell('');
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

            <div className="space-y-2">
              <Label>Upsell *</Label>
              <Select 
                value={selectedUpsell} 
                onValueChange={setSelectedUpsell}
                disabled={!selectedMainProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o upsell..." />
                </SelectTrigger>
                <SelectContent>
                  {getOtherProducts(selectedMainProduct).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.is_hot ? '🔥 ' : ''}{p.name} - {formatPrice(Number(p.price))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Oferecido após a compra ser confirmada</p>
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
                  {getOtherProducts(selectedMainProduct).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.is_hot ? '🔥 ' : ''}{p.name} - {formatPrice(Number(p.price))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Oferecido se o cliente recusar o upsell</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddFunnel} disabled={!selectedMainProduct || !selectedUpsell}>
              Adicionar Funil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
