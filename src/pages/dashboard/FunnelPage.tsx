import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { useProducts, useUpdateProduct, Product } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch, ArrowDown, ArrowRight, Check, X, Loader2, Package, TrendingUp, TrendingDown } from 'lucide-react';
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
  const updateProduct = useUpdateProduct();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [upsellId, setUpsellId] = useState<string>('');
  const [downsellId, setDownsellId] = useState<string>('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getProductById = (id: string | null | undefined): FunnelProduct | undefined => {
    if (!id) return undefined;
    return products?.find(p => p.id === id) as FunnelProduct | undefined;
  };

  const handleEdit = (product: FunnelProduct) => {
    setEditingProduct(product.id);
    setUpsellId(product.upsell_product_id || '');
    setDownsellId(product.downsell_product_id || '');
  };

  const handleSave = async (product: FunnelProduct) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        clientId: client.id,
        upsell_product_id: upsellId || null,
        downsell_product_id: downsellId || null,
      } as any);
      toast.success('Funil atualizado!');
      setEditingProduct(null);
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setUpsellId('');
    setDownsellId('');
  };

  const getOtherProducts = (currentId: string) => {
    return products?.filter(p => p.id !== currentId && p.is_active) || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeProducts = (products?.filter(p => p.is_active) || []) as FunnelProduct[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-primary" />
          Funil de Vendas
        </h1>
        <p className="text-muted-foreground">
          Configure upsells e downsells para maximizar suas vendas
        </p>
      </div>

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

      {/* Funnel Configuration */}
      <div className="space-y-4">
        {activeProducts.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum produto ativo encontrado.</p>
              <p className="text-sm text-muted-foreground">Crie produtos na aba Produtos para configurar o funil.</p>
            </CardContent>
          </Card>
        ) : (
          activeProducts.map((product) => {
            const isEditing = editingProduct === product.id;
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
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        Configurar Funil
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(product)}
                          disabled={updateProduct.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    )}
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
                      {isEditing ? (
                        <Select value={upsellId || 'none'} onValueChange={(v) => setUpsellId(v === 'none' ? '' : v)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {otherProducts.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} - {formatPrice(Number(p.price))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : upsellProduct ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {upsellProduct.name} - {formatPrice(Number(upsellProduct.price))}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Não configurado</p>
                      )}
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
                      {isEditing ? (
                        <Select value={downsellId || 'none'} onValueChange={(v) => setDownsellId(v === 'none' ? '' : v)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {otherProducts.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} - {formatPrice(Number(p.price))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : downsellProduct ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {downsellProduct.name} - {formatPrice(Number(downsellProduct.price))}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Não configurado</p>
                      )}
                    </div>
                  </div>

                  {/* Flow visualization */}
                  {(upsellProduct || downsellProduct) && !isEditing && (
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
                  )}
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
            <li>• <strong>Lembre-se:</strong> Ative o Upsell nas Configurações para o funil funcionar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
